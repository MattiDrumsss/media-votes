import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { today } from './utils';

const Ctx = createContext();
export const useStore = () => useContext(Ctx);
const mapG = (g) => ({ id: g.id, subjectId: g.subject_id, value: Number(g.value), date: g.date, type: g.type, note: g.note || '' });
const DEFAULTS = ['Italiano', 'Matematica', 'Inglese', 'Storia'];
const FAIL = 'Operazione non riuscita';
const fail = (e) => FAIL + ': ' + (e?.message || 'errore sconosciuto');

export function StoreProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id;
  useEffect(() => {
    if (!uid) { setSubjects([]); setGrades([]); return; }
    let off = false; setLoading(true);
    (async () => {
      const [s, g] = await Promise.all([supabase.from('subjects').select('id,name').order('created_at'), supabase.from('grades').select('*')]);
      if (off) return;
      if (s.error || g.error) { setError('Impossibile caricare i dati: ' + (s.error || g.error).message); setLoading(false); return; }
      let subs = s.data; const flag = 'mv-seeded:' + uid;
      if (!subs.length && !g.data.length && !localStorage.getItem(flag)) {
        const r = await supabase.from('subjects').insert(DEFAULTS.map((name) => ({ name }))).select('id,name');
        if (!r.error) { subs = r.data; localStorage.setItem(flag, '1'); }
      }
      if (off) return;
      setSubjects(subs); setGrades(g.data.map(mapG)); setError(''); setLoading(false);
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
    session, subjects, grades, loading, error,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    async addSubject(name) {
      const e = check(name); if (e) return e;
      const r = await supabase.from('subjects').insert({ name: name.trim() }).select('id,name').single();
      if (r.error) return fail(r.error);
      setSubjects((s) => [...s, r.data]);
    },
    async renameSubject(id, name) {
      const e = check(name, id); if (e) return e;
      const r = await supabase.from('subjects').update({ name: name.trim() }).eq('id', id);
      if (r.error) return fail(r.error);
      setSubjects((s) => s.map((x) => (x.id === id ? { ...x, name: name.trim() } : x)));
    },
    async deleteSubject(id) {
      const r = await supabase.from('subjects').delete().eq('id', id);
      if (r.error) return setError(fail(r.error));
      setSubjects((s) => s.filter((x) => x.id !== id)); setGrades((g) => g.filter((x) => x.subjectId !== id));
    },
    async saveGrade(g) {
      const row = { subject_id: g.subjectId, value: g.value, date: g.date, type: g.type, note: g.note };
      const q = supabase.from('grades');
      const r = g.id ? await q.update(row).eq('id', g.id).select().single() : await q.insert(row).select().single();
      if (r.error) return fail(r.error);
      const n = mapG(r.data);
      setGrades((a) => (g.id ? a.map((x) => (x.id === n.id ? n : x)) : [...a, n]));
    },
    async deleteGrade(id) {
      const r = await supabase.from('grades').delete().eq('id', id);
      if (r.error) return setError(fail(r.error));
      setGrades((a) => a.filter((x) => x.id !== id));
    },
    async importData(obj) {
      if (!obj || !Array.isArray(obj.subjects) || !Array.isArray(obj.grades)) return 'File non valido.';
      const map = {}; const subs = [];
      for (const s of obj.subjects) {
        const n = typeof s?.name === 'string' ? s.name.trim() : '';
        if (s?.id && n && !subs.some((x) => x.name.toLowerCase() === n.toLowerCase())) { const id = crypto.randomUUID(); map[String(s.id)] = id; subs.push({ id, name: n }); }
      }
      const gr = obj.grades.filter((g) => g && map[String(g.subjectId)] && Number(g.value) >= 1 && Number(g.value) <= 10)
        .map((g) => ({ subject_id: map[String(g.subjectId)], value: Number(g.value), date: g.date || today(), type: ['scritto', 'orale', 'pratico'].includes(g.type) ? g.type : 'scritto', note: g.note || '' }));
      const d = await supabase.from('subjects').delete().eq('user_id', uid);
      if (d.error) return 'Importazione non riuscita.';
      let ns = [], ng = [];
      if (subs.length) { const r = await supabase.from('subjects').insert(subs).select('id,name'); if (r.error) return 'Importazione non riuscita.'; ns = r.data; }
      if (gr.length) { const r = await supabase.from('grades').insert(gr).select(); if (r.error) return 'Importazione non riuscita.'; ng = r.data; }
      setSubjects(ns); setGrades(ng.map(mapG)); return null;
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
