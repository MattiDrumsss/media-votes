import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { today, periodOf } from './utils';
import { COLORS, ICONS } from './icons.jsx';

const Ctx = createContext();
export const useStore = () => useContext(Ctx);
const mapG = (g) => ({ id: g.id, subjectId: g.subject_id, value: Number(g.value), date: g.date, type: g.type, note: g.note || '' });
const mapE = (e) => ({ id: e.id, subjectId: e.subject_id, date: e.date, kind: e.kind, note: e.note || '' });
const DEFAULTS = [['Italiano', 'book', COLORS[0]], ['Matematica', 'calc', COLORS[2]], ['Inglese', 'lang', COLORS[4]], ['Storia', 'history', COLORS[5]]];
const okColor = (c) => (/^#[0-9a-f]{6}$/i.test(c) ? c : COLORS[0]);
const okIcon = (i) => (ICONS[i] ? i : 'book');
const FAIL = 'Operazione non riuscita';
const fail = (e) => FAIL + ': ' + (e?.message || 'errore sconosciuto');
const SUB = 'id,name,color,icon';

export function StoreProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [subjects, setSubjects] = useState([]);
  const [allGrades, setAll] = useState([]);
  const [events, setEvents] = useState([]);
  const [pf, setPf] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id;
  const mode = session?.user?.user_metadata?.period === 'tri' ? 'tri' : 'quad';
  const grades = useMemo(() => (pf === 'all' ? allGrades : allGrades.filter((g) => periodOf(g.date, mode) === pf)), [allGrades, pf, mode]);

  useEffect(() => {
    if (!uid) { setSubjects([]); setAll([]); setEvents([]); return; }
    let off = false; setLoading(true);
    (async () => {
      const [s, g, e] = await Promise.all([supabase.from('subjects').select(SUB).order('created_at'), supabase.from('grades').select('*'), supabase.from('events').select('*')]);
      if (off) return;
      if (s.error || g.error) { setError('Impossibile caricare i dati: ' + (s.error || g.error).message); setLoading(false); return; }
      let subs = s.data; const flag = 'mv-seeded:' + uid;
      if (!subs.length && !g.data.length && !localStorage.getItem(flag)) {
        const r = await supabase.from('subjects').insert(DEFAULTS.map(([name, icon, color]) => ({ name, icon, color }))).select(SUB);
        if (!r.error) { subs = r.data; localStorage.setItem(flag, '1'); }
      }
      if (off) return;
      setSubjects(subs); setAll(g.data.map(mapG)); setEvents(e.error ? [] : e.data.map(mapE)); setError(''); setLoading(false);
    })();
    return () => { off = true; };
  }, [uid]);

  const check = (name, except) => {
    name = name.trim();
    if (!name) return 'Inserisci un nome.';
    if (subjects.some((s) => s.id !== except && s.name.toLowerCase() === name.toLowerCase())) return 'Esiste già una materia con questo nome.';
    return null;
  };

  const api = {
    session, subjects, grades, allGrades, events, loading, error, pf, setPf, mode,
    setMode: (m) => supabase.auth.updateUser({ data: { period: m } }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    async addSubject(name) {
      const e = check(name); if (e) return e;
      const r = await supabase.from('subjects').insert({ name: name.trim(), color: COLORS[subjects.length % COLORS.length], icon: 'book' }).select(SUB).single();
      if (r.error) return fail(r.error);
      setSubjects((s) => [...s, r.data]);
    },
    async updateSubject(id, { name, color, icon }) {
      const e = check(name, id); if (e) return e;
      const r = await supabase.from('subjects').update({ name: name.trim(), color, icon }).eq('id', id);
      if (r.error) return fail(r.error);
      setSubjects((s) => s.map((x) => (x.id === id ? { ...x, name: name.trim(), color, icon } : x)));
    },
    async deleteSubject(id) {
      const r = await supabase.from('subjects').delete().eq('id', id);
      if (r.error) return setError(fail(r.error));
      setSubjects((s) => s.filter((x) => x.id !== id)); setAll((g) => g.filter((x) => x.subjectId !== id)); setEvents((v) => v.filter((x) => x.subjectId !== id));
    },
    async saveGrade(g) {
      const row = { subject_id: g.subjectId, value: g.value, date: g.date, type: g.type, note: g.note };
      const q = supabase.from('grades');
      const r = g.id ? await q.update(row).eq('id', g.id).select().single() : await q.insert(row).select().single();
      if (r.error) return fail(r.error);
      const n = mapG(r.data);
      setAll((a) => (g.id ? a.map((x) => (x.id === n.id ? n : x)) : [...a, n]));
    },
    async deleteGrade(id) {
      const r = await supabase.from('grades').delete().eq('id', id);
      if (r.error) return setError(fail(r.error));
      setAll((a) => a.filter((x) => x.id !== id));
    },
    async addEvent(e) {
      const r = await supabase.from('events').insert({ subject_id: e.subjectId, date: e.date, kind: e.kind, note: e.note.trim() }).select().single();
      if (r.error) return fail(r.error);
      setEvents((v) => [...v, mapE(r.data)]);
    },
    async deleteEvent(id) {
      const r = await supabase.from('events').delete().eq('id', id);
      if (r.error) return setError(fail(r.error));
      setEvents((v) => v.filter((x) => x.id !== id));
    },
    async importData(obj) {
      if (!obj || !Array.isArray(obj.subjects) || !Array.isArray(obj.grades)) return 'File non valido.';
      const map = {}; const subs = [];
      for (const s of obj.subjects) {
        const n = typeof s?.name === 'string' ? s.name.trim() : '';
        if (s?.id && n && !subs.some((x) => x.name.toLowerCase() === n.toLowerCase())) { const id = crypto.randomUUID(); map[String(s.id)] = id; subs.push({ id, name: n, color: okColor(s.color), icon: okIcon(s.icon) }); }
      }
      const gr = obj.grades.filter((g) => g && map[String(g.subjectId)] && Number(g.value) >= 1 && Number(g.value) <= 10)
        .map((g) => ({ subject_id: map[String(g.subjectId)], value: Number(g.value), date: g.date || today(), type: ['scritto', 'orale', 'pratico'].includes(g.type) ? g.type : 'scritto', note: g.note || '' }));
      const ev = (Array.isArray(obj.events) ? obj.events : []).filter((e) => e && map[String(e.subjectId)] && e.date)
        .map((e) => ({ subject_id: map[String(e.subjectId)], date: e.date, kind: e.kind === 'interrogazione' ? 'interrogazione' : 'verifica', note: e.note || '' }));
      const d = await supabase.from('subjects').delete().eq('user_id', uid);
      if (d.error) return fail(d.error);
      let ns = [], ng = [], ne = [];
      if (subs.length) { const r = await supabase.from('subjects').insert(subs).select(SUB); if (r.error) return fail(r.error); ns = r.data; }
      if (gr.length) { const r = await supabase.from('grades').insert(gr).select(); if (r.error) return fail(r.error); ng = r.data; }
      if (ev.length) { const r = await supabase.from('events').insert(ev).select(); if (!r.error) ne = r.data; }
      setSubjects(ns); setAll(ng.map(mapG)); setEvents(ne.map(mapE)); return null;
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
