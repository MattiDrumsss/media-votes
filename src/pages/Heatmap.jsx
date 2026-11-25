import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, fmt, fdate, today } from '../utils';
import { SubjIcon } from '../icons.jsx';

const iso = (d) => d.toLocaleDateString('en-CA');
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const level = (a) => (a == null ? 0 : a < 6 ? 1 : a < 7 ? 2 : a < 8 ? 3 : 4);
const schoolYear = (d) => (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1);

export default function Heatmap() {
  const { subjects, allGrades } = useStore();
  const nowY = schoolYear(new Date());
  const oldest = allGrades.reduce((m, g) => (g.date < m ? g.date : m), today());
  const minY = Math.min(nowY, schoolYear(new Date(oldest + 'T00:00')));
  const [y, setY] = useState(nowY); const [sel, setSel] = useState(today()); const box = useRef();
  const byDay = useMemo(() => { const m = {}; allGrades.forEach((g) => (m[g.date] ||= []).push(g)); return m; }, [allGrades]);
  const { days, cols, labels } = useMemo(() => {
    const first = new Date(y, 8, 1), last = new Date(y + 1, 7, 31);
    const d = new Date(first); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const days = [];
    while (d <= last || days.length % 7) { days.push({ date: iso(d), out: d < first || d > last, m: d.getMonth(), dow: days.length % 7 }); d.setDate(d.getDate() + 1); }
    const cols = days.length / 7; const labels = []; let prev = -1;
    for (let i = 0; i < cols; i++) { const m = days[i * 7 + 3].m; if (m !== prev) { labels.push({ i, t: MONTHS[m] }); prev = m; } }
    return { days, cols, labels };
  }, [y]);
  useEffect(() => {
    if (!box.current) return;
    const idx = days.findIndex((d) => d.date === today());
    box.current.scrollLeft = y === nowY && idx >= 0 ? Math.floor(idx / 7) * 20 - box.current.clientWidth / 2 : 0;
  }, [y, days]);
  const inYear = days.filter((d) => !d.out);
  const avgs = inYear.map((d) => (byDay[d.date] ? avg(byDay[d.date]) : null)).filter((v) => v != null);
  const gs = byDay[sel] || [];
  return (
    <div>
      <header className="top"><div><h1>Mappa dei voti</h1><p className="muted">Ogni quadratino è un giorno: più è verde, più è alta la media di quel giorno.</p></div></header>
      <div className="row between yearbar">
        <button className="icon-btn" onClick={() => setY(y - 1)} disabled={y <= minY} aria-label="Anno precedente"><ChevronLeft size={20} /></button>
        <b>Anno scolastico {y}/{String(y + 1).slice(2)}</b>
        <button className="icon-btn" onClick={() => setY(y + 1)} disabled={y >= nowY} aria-label="Anno successivo"><ChevronRight size={20} /></button>
      </div>
      <section className="stats">
        <div className="card rise"><span className="label">Giorni con voti</span><b className="mid">{avgs.length}</b></div>
        <div className="card rise" style={{ '--i': 1 }}><span className="label">Giorni da 7 in su</span><b className="mid">{avgs.filter((v) => v >= 7).length}</b></div>
        <div className="card rise" style={{ '--i': 2 }}><span className="label">Giorni sotto il 6</span><b className="mid">{avgs.filter((v) => v < 6).length}</b></div>
      </section>
      <div className="card heatcard">
        <div className="heatscroll" ref={box}>
          <div className="heatmonths" style={{ gridTemplateColumns: `repeat(${cols}, 16px)` }}>{labels.map((l) => <span key={l.i} style={{ gridColumn: l.i + 1 }}>{l.t}</span>)}</div>
          <div className="heat">
            {days.map((d) => {
              if (d.out) return <span key={d.date} className="hc out" />;
              const g = byDay[d.date]; const a = g ? avg(g) : null;
              return <button key={d.date} className={`hc l${level(a)} ${sel === d.date ? 'sel' : ''} ${d.date === today() ? 'now' : ''}`} onClick={() => setSel(d.date)} aria-label={`${fdate(d.date)}${a != null ? ', media ' + fmt(a) : ''}`} />;
            })}
          </div>
        </div>
        <div className="legend small muted"><span><i className="hc l0" />Nessun voto</span><span><i className="hc l1" />Sotto il 6</span><span><i className="hc l2" />6–7</span><span><i className="hc l3" />7–8</span><span><i className="hc l4" />8 o più</span></div>
      </div>
      <h2>{fdate(sel)}</h2>
      {gs.length ? <div className="list">{gs.map((g) => { const s = subjects.find((x) => x.id === g.subjectId); return s && (
        <div key={g.id} className="card item rise"><SubjIcon s={s} /><div className="grow"><b>{s.name}</b> <span className="pill">{g.type}</span>{g.note && <p className="muted small">{g.note}</p>}</div><div className="val">{fmt(g.value)}</div></div>); })}</div>
        : <div className="card empty">Nessun voto in questo giorno.</div>}
    </div>
  );
}
