import { useState } from 'react';
import { Plus, Settings, Flame, Search, SlidersHorizontal, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { useStore } from '../store.jsx';
import { avg, fmt, tone, daysUntil, byDate, fdate } from '../utils';
import { achievements } from '../achievements';
import { Bar, SubjectGrid, PeriodBar, CountUp } from '../ui.jsx';
import { EventRow } from './Calendar.jsx';
import { SubjIcon } from '../icons.jsx';
import { acc } from '../theme';

const DEF = [['stats', true], ['pending', true], ['last', true], ['next', true], ['subjects', true], ['streak', false], ['trend', false]];
const TITLES = { stats: 'Media e numeri', pending: 'Da registrare', last: 'Ultimo voto', next: 'Prossime verifiche', subjects: 'Le mie materie', streak: 'Serie di voti', trend: 'Andamento della media' };
const defLayout = () => DEF.map(([id, on]) => ({ id, on }));
const load = () => {
  try {
    const a = JSON.parse(localStorage.getItem('mv-dash'));
    if (Array.isArray(a)) { const base = a.filter((x) => TITLES[x.id]); DEF.forEach(([id, on]) => { if (!base.some((x) => x.id === id)) base.push({ id, on }); }); return base; }
  } catch { /* predefinito */ }
  return defLayout();
};

export default function Dashboard({ go, openQuick, openAdd, openSearch, ask }) {
  const { subjects, grades, allGrades, events, deleteEvent } = useStore();
  const [layout, setLayout] = useState(load); const [edit, setEdit] = useState(false); const [moved, setMoved] = useState(null);
  const save = (l) => { setLayout(l); try { localStorage.setItem('mv-dash', JSON.stringify(l)); } catch { /* ok */ } };
  const move = (i, d) => { const l = [...layout]; const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; save(l); setMoved(l[j].id); setTimeout(() => setMoved(null), 650); };
  const toggle = (i) => save(layout.map((b, k) => (k === i ? { ...b, on: !b.on } : b)));

  const gen = avg(grades); const { streak, best } = achievements(allGrades, subjects);
  const next = [...events].filter((e) => daysUntil(e.date) >= 0).sort(byDate).slice(0, 3);
  const pending = [...events].filter((e) => { const n = daysUntil(e.date); return n < 0 && n >= -14; }).sort(byDate).reverse().slice(0, 3);
  const last = [...allGrades].sort(byDate).pop(); const lastS = last && subjects.find((s) => s.id === last.subjectId);
  let sum = 0; const series = [...grades].sort(byDate).map((g, i) => { sum += g.value; return { v: +(sum / (i + 1)).toFixed(2) }; });
  const c = acc();

  const R = {
    stats: () => (
      <section className="stats">
        <div className={`card hero rise ${tone(gen)}`}><span className="label">Media generale</span><b className="big"><CountUp value={gen} /></b><Bar value={gen} /></div>
        <div className="card rise" style={{ '--i': 1 }}><span className="label">Voti totali</span><b className="mid"><CountUp value={grades.length} dec={0} /></b></div>
        <div className="card rise" style={{ '--i': 2 }}><span className="label">Materie attive</span><b className="mid"><CountUp value={subjects.length} dec={0} /></b></div>
      </section>),
    pending: () => pending.length ? (
      <div><h2>Hai preso il voto?</h2><div className="list">{pending.map((e) => <EventRow key={e.id} e={e} onRegister={() => openAdd(e.subjectId, e.id)} onDelete={() => ask({ title: 'Elimina prova', text: 'Vuoi eliminare questa prova dal calendario?', onOk: () => deleteEvent(e.id) })} />)}</div></div>) : null,
    last: () => lastS ? (
      <button className={`card item grade lastcard rise ${tone(last.value)}`} onClick={() => go('detail', lastS.id)}>
        <SubjIcon s={lastS} /><div className="grow"><span className="label">Ultimo voto</span><div className="gline"><b>{lastS.name}</b><span className="pill">{last.type}</span></div><p className="muted small">{fdate(last.date)}</p></div><div className="gval">{fmt(last.value)}</div>
      </button>) : null,
    next: () => next.length ? <div><h2>Prossime verifiche</h2><div className="list">{next.map((e) => <EventRow key={e.id} e={e} compact />)}</div></div> : null,
    subjects: () => <div><h2>Le mie materie</h2><SubjectGrid go={go} /></div>,
    streak: () => <div className="card streakcard rise"><Flame size={30} /><div className="grow"><b className="mid"><CountUp value={streak} dec={0} /></b><span className="muted small"> voti sufficienti di fila</span></div><span className="muted small">Record: {best}</span></div>,
    trend: () => series.length >= 2 ? (
      <div className="card rise"><span className="label">Andamento della media</span>
        <div style={{ height: 110, marginTop: 8 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={series}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.5} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient></defs><YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} /><Area type="monotone" dataKey="v" stroke={c} strokeWidth={2.5} fill="url(#sg)" animationDuration={1600} /></AreaChart></ResponsiveContainer></div>
      </div>) : null,
  };

  return (
    <div>
      <header className="top">
        <img src="/logo.png" className="logo mobile-logo" alt="Media Votes" />
        <div><h1>Bentornato</h1><p className="muted">Ecco come stanno andando i tuoi voti.</p></div>
        <div className="row">
          {streak > 0 && <span className="streak"><Flame size={16} />{streak}</span>}
          <button className="icon-btn" onClick={openSearch} aria-label="Cerca voti"><Search size={20} /></button>
          <button className={`icon-btn ${edit ? 'actv' : ''}`} onClick={() => setEdit(!edit)} aria-label="Personalizza dashboard"><SlidersHorizontal size={20} /></button>
          <button className="icon-btn" onClick={() => go('settings')} aria-label="Impostazioni"><Settings size={20} /></button>
          <button className="btn" onClick={() => openQuick()}><Plus size={18} />AGGIUNGI VOTO</button>
        </div>
      </header>
      {edit && (
        <div className="card editbar">
          <div><b>Personalizza</b><p className="muted small">Sposta i blocchi con le frecce, nascondili con l'occhio.</p></div>
          <div className="row"><button className="icon-btn" onClick={() => save(defLayout())} aria-label="Ripristina"><RotateCcw size={18} /></button><button className="btn sm" onClick={() => setEdit(false)}><Check size={16} />Fatto</button></div>
        </div>)}
      <PeriodBar />
      {layout.map((b, i) => {
        if (!edit && !b.on) return null;
        const body = R[b.id](); if (!edit && !body) return null;
        return (
          <div key={b.id} className={`dblock ${edit ? 'editing' : ''} ${edit && !b.on ? 'off' : ''} ${moved === b.id ? 'moved' : ''}`}>
            {edit && <div className="dbar"><b>{TITLES[b.id]}</b><div className="row"><button className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Su"><ArrowUp size={16} /></button><button className="icon-btn" disabled={i === layout.length - 1} onClick={() => move(i, 1)} aria-label="Giù"><ArrowDown size={16} /></button><button className="icon-btn" onClick={() => toggle(i)} aria-label={b.on ? 'Nascondi' : 'Mostra'}>{b.on ? <Eye size={16} /> : <EyeOff size={16} />}</button></div></div>}
            <div className="dbody">{body || <div className="card empty">Niente da mostrare adesso</div>}</div>
          </div>);
      })}
    </div>
  );
}
