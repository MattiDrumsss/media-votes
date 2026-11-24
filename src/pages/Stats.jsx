import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Rocket, ListChecks, Trophy, Crown, Target, Flame, Zap, TrendingUp, Medal, ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, byDate } from '../utils';
import { Chart, Trend, tip, gradeSeries } from '../charts.jsx';
import { achievements } from '../achievements';
import { PeriodBar } from '../ui.jsx';

const ax = { stroke: '#8b86a3', fontSize: 12 };
const AI = { Rocket, ListChecks, Trophy, Crown, Target, Flame, Zap, TrendingUp, Medal, ShieldCheck };
export default function Stats() {
  const { subjects, grades, allGrades } = useStore();
  const [sid, setSid] = useState('');
  const cur = subjects.find((s) => s.id === sid) || subjects[0];
  let sum = 0;
  const general = [...grades].sort(byDate).map((g, i) => { sum += g.value; return { d: new Date(g.date + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }), v: +(sum / (i + 1)).toFixed(2) }; });
  const dist = Array.from({ length: 10 }, (_, i) => ({ n: String(i + 1), c: grades.filter((g) => Math.floor(g.value) === i + 1).length }));
  const comp = subjects.map((s) => ({ n: s.name, v: +(avg(grades.filter((g) => g.subjectId === s.id)) ?? 0).toFixed(2) })).filter((x) => x.v > 0);
  const { list, streak, best } = achievements(allGrades, subjects);
  return (
    <div>
      <header className="top"><div><h1>Statistiche</h1><p className="muted">I grafici si aggiornano a ogni modifica.</p></div></header>
      <PeriodBar />
      {!grades.length ? <div className="card empty">Nessun voto in questo periodo: aggiungine uno per vedere i grafici.</div> : (
        <div className="cols">
          <div className="card rise"><h3>Andamento della media generale</h3><Trend data={general} name="Media" /></div>
          <div className="card rise" style={{ '--i': 1 }}>
            <div className="row between"><h3>Andamento per materia</h3><select className="sel" value={cur?.id} onChange={(e) => setSid(e.target.value)}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <Trend data={gradeSeries(grades.filter((g) => g.subjectId === cur?.id))} name={cur?.name} />
          </div>
          <div className="card rise" style={{ '--i': 2 }}><h3>Distribuzione dei voti</h3>
            <Chart><BarChart data={dist} margin={{ left: -25, top: 8 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="n" {...ax} /><YAxis allowDecimals={false} {...ax} /><Tooltip {...tip} formatter={(v) => [v, 'Voti']} labelFormatter={(l) => `Da ${l} a ${l},99`} /><Bar dataKey="c" fill="#a855f7" radius={[6, 6, 0, 0]} /></BarChart></Chart>
          </div>
          <div className="card rise" style={{ '--i': 3 }}><h3>Confronto tra le materie</h3>
            <Chart><BarChart data={comp} margin={{ left: -25, top: 8 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="n" {...ax} /><YAxis domain={[0, 10]} {...ax} /><Tooltip {...tip} formatter={(v) => [String(v).replace('.', ','), 'Media']} /><Bar dataKey="v" fill="#7c3aed" radius={[6, 6, 0, 0]} /></BarChart></Chart>
          </div>
        </div>
      )}
      <h2>Serie e traguardi</h2>
      <div className="stats"><div className="card"><span className="label">Serie attuale</span><b className="mid">{streak}</b><span className="muted small">voti sufficienti di fila</span></div><div className="card"><span className="label">Serie migliore</span><b className="mid">{best}</b><span className="muted small">il tuo record</span></div></div>
      <div className="grid ach">
        {list.map((a, i) => { const I = AI[a.icon]; return (
          <div key={a.id} className={`card rise ${a.done ? 'got' : 'lock'}`} style={{ '--i': i }}>
            <span className="medal">{a.done ? <I size={22} /> : <Lock size={20} />}</span>
            <b>{a.title}</b><p className="muted small">{a.desc}</p>
            <div className="bar"><i style={{ width: `${(a.cur / a.max) * 100}%` }} /></div>
            <span className="small muted">{a.cur}/{a.max}</span>
          </div>); })}
      </div>
    </div>
  );
}
