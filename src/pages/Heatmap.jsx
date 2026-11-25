import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LocateFixed } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, fmt, fdate, today, tone } from '../utils';
import { SubjIcon } from '../icons.jsx';
import { CountUp } from '../ui.jsx';

const iso = (d) => d.toLocaleDateString('en-CA');
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const LV = [[0, 'Nessun voto'], [1, 'Sotto il 6'], [2, 'Da 6 a 7'], [3, 'Da 7 a 8'], [4, '8 o più']];
const level = (a) => (a == null ? 0 : a < 6 ? 1 : a < 7 ? 2 : a < 8 ? 3 : 4);
const schoolYear = (d) => (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1);
const STEP = 22;

export default function Heatmap() {
  const { subjects, allGrades } = useStore();
  const nowY = schoolYear(new Date());
  const oldest = allGrades.reduce((m, g) => (g.date < m ? g.date : m), today());
  const minY = Math.min(nowY, schoolYear(new Date(oldest + 'T00:00')));
  const [y, setY] = useState(nowY); const [sel, setSel] = useState(today()); const [hov, setHov] = useState(null); const [flt, setFlt] = useState(null);
  const box = useRef();
  const byDay = useMemo(() => { const m = {}; allGrades.forEach((g) => (m[g.date] ||= []).push(g)); return m; }, [allGrades]);
  const { days, cols, labels } = useMemo(() => {
    const first = new Date(y, 8, 1), last = new Date(y + 1, 7, 31);
    const d = new Date(first); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const days = [];
    while (d <= last || days.length % 7) { days.push({ date: iso(d), out: d < first || d > last, m: d.getMonth() }); d.setDate(d.getDate() + 1); }
    const cols = days.length / 7; const labels = []; let prev = -1;
    for (let i = 0; i < cols; i++) { const m = days[i * 7 + 3].m; if (m !== prev) { labels.push({ i, t: MONTHS[m] }); prev = m; } }
    return { days, cols, labels };
  }, [y]);
  const toToday = (smooth) => {
    const idx = days.findIndex((d) => d.date === today()); if (!box.current) return;
    const left = y === nowY && idx >= 0 ? Math.floor(idx / 7) * STEP - box.current.clientWidth / 2 : 0;
    box.current.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  };
  useEffect(() => { toToday(false); }, [y, days]);
  const avgs = days.filter((d) => !d.out && byDay[d.date]).map((d) => avg(byDay[d.date]));
  const info = (date) => { const g = byDay[date]; return g ? `${fdate(date)} – media ${fmt(avg(g))} (${g.length} ${g.length === 1 ? 'voto' : 'voti'})` : `${fdate(date)} – nessun voto`; };
  const gs = byDay[sel] || []; const dayAvg = gs.length ? avg(gs) : null;
  return (
    <div>
      <header className="top"><div><h1>Mappa dei voti</h1><p className="muted">Ogni quadratino è un giorno dell'anno scolastico.</p></div></header>
      <div className="row between yearbar">
        <button className="icon-btn" onClick={() => setY(y - 1)} disabled={y <= minY} aria-label="Anno precedente"><ChevronLeft size={20} /></button>
        <b>Anno scolastico {y}/{String(y + 1).slice(2)}</b>
        <button className="icon-btn" onClick={() => setY(y + 1)} disabled={y >= nowY} aria-label="Anno successivo"><ChevronRight size={20} /></button>
      </div>
      <section className="stats">
        <div className="card rise"><span className="label">Giorni con voti</span><b className="mid"><CountUp value={avgs.length} dec={0} /></b></div>
        <div className="card rise" style={{ '--i': 1 }}><span className="label">Giorni da 7 in su</span><b className="mid"><CountUp value={avgs.filter((v) => v >= 7).length} dec={0} /></b></div>
        <div className="card rise" style={{ '--i': 2 }}><span className="label">Giorni sotto il 6</span><b className="mid"><CountUp value={avgs.filter((v) => v < 6).length} dec={0} /></b></div>
      </section>
      <p className="muted small hint">Tocca un quadratino per vedere i voti di quel giorno. Tocca un colore qui sotto per evidenziare solo quelli.</p>
      <div className="card heatcard">
        <div className="row between caption"><span key={hov || sel}>{info(hov || sel)}</span>{y === nowY && <button className="btn ghost sm" onClick={() => toToday(true)}><LocateFixed size={15} />Oggi</button>}</div>
        <div className="heatwrap">
          <div className="daylabels">{['Lun', '', 'Mer', '', 'Ven', '', 'Dom'].map((t, i) => <span key={i}>{t}</span>)}</div>
          <div className="heatscroll" ref={box}>
            <div className="heatmonths" style={{ gridTemplateColumns: `repeat(${cols}, ${STEP - 4}px)` }}>{labels.map((l) => <span key={l.i} style={{ gridColumn: l.i + 1 }}>{l.t}</span>)}</div>
            <div className="heat" key={y} onMouseLeave={() => setHov(null)}>
              {days.map((d, i) => {
                if (d.out) return <span key={d.date} className="hc out" />;
                const g = byDay[d.date]; const a = g ? avg(g) : null; const l = level(a);
                return <button key={d.date} style={{ '--w': Math.floor(i / 7) }} className={`hc l${l} ${sel === d.date ? 'sel' : ''} ${d.date === today() ? 'now' : ''} ${flt != null && flt !== l ? 'dim' : ''}`}
                  onClick={() => setSel(d.date)} onMouseEnter={() => setHov(d.date)} aria-label={info(d.date)} />;
              })}
            </div>
          </div>
        </div>
        <div className="legend">{LV.map(([k, t]) => <button key={k} className={flt === k ? 'on' : ''} onClick={() => setFlt(flt === k ? null : k)}><i className={`hc l${k}`} />{t}</button>)}</div>
      </div>
      <div key={sel} className="page">
        <div className="dayhead"><h2>{fdate(sel)}</h2>{dayAvg != null && <span className={`daybadge ${tone(dayAvg)}`}>media <CountUp value={dayAvg} /></span>}</div>
        {gs.length ? <div className="list">{gs.map((g, i) => { const s = subjects.find((x) => x.id === g.subjectId); return s && (
          <div key={g.id} className="card item rise" style={{ '--i': i }}><SubjIcon s={s} /><div className="grow"><b>{s.name}</b> <span className="pill">{g.type}</span>{g.note && <p className="muted small">{g.note}</p>}</div><div className={`val ${tone(g.value)}`}>{fmt(g.value)}</div></div>); })}</div>
          : <div className="card empty">Nessun voto in questo giorno.</div>}
      </div>
    </div>
  );
}
