import { useState } from 'react';
import { ArrowLeft, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, fmt, tone, toneLabel, fdate, byDate, trendOf } from '../utils';
import { PeriodBar, TrendIcon, CountUp, Ring, Bar } from '../ui.jsx';
import { SubjIcon } from '../icons.jsx';
import { Trend, gradeSeries } from '../charts.jsx';

export default function SubjectDetail({ id, go, openQuick, openEdit, ask }) {
  const { subjects, grades, deleteGrade } = useStore();
  const [menu, setMenu] = useState(null);
  const s = subjects.find((x) => x.id === id);
  if (!s) return <div className="card empty">Materia non trovata. <button className="btn ghost" onClick={() => go('subjects')}>Torna alle materie</button></div>;
  const gs = grades.filter((g) => g.subjectId === id);
  const a = avg(gs); const t = tone(a); const vals = gs.map((g) => g.value);
  const list = [...gs].sort(byDate).reverse();
  const groups = [];
  list.forEach((g) => { const k = g.date.slice(0, 7); const last = groups[groups.length - 1]; if (last && last.k === k) last.items.push(g); else groups.push({ k, items: [g] }); });
  let n = 0;
  return (
    <div onClick={() => setMenu(null)}>
      <button className="back" onClick={() => go('subjects')}><ArrowLeft size={18} />Materie</button>
      <section className="card subhero rise" style={{ '--c': s.color }}>
        <div className="subhero-top">
          <SubjIcon s={s} size={26} />
          <div className="grow"><h1>{s.name}</h1><span className="pill">{toneLabel[t]}</span></div>
          <button className="btn sm" onClick={() => openQuick(id)}><Plus size={16} />Voto</button>
        </div>
        <div className="subhero-body">
          <Ring value={a} t={t} size={124} stroke={11}><span className="bigring"><CountUp value={a} /></span></Ring>
          <div className="chips4">
            <div><span>Voti</span><b>{gs.length}</b></div>
            <div><span>Andamento</span><b><TrendIcon t={trendOf(gs)} />{!trendOf(gs) && '—'}</b></div>
            <div><span>Più alto</span><b>{gs.length ? fmt(Math.max(...vals)) : '—'}</b></div>
            <div><span>Più basso</span><b>{gs.length ? fmt(Math.min(...vals)) : '—'}</b></div>
          </div>
        </div>
      </section>
      <PeriodBar />
      <h2>Andamento</h2>
      <div className="card rise" style={{ '--i': 1 }}><Trend data={gradeSeries(gs)} name={s.name} /></div>
      <h2>Tutti i voti</h2>
      {!list.length ? <div className="card empty">Nessun voto in questa materia.</div> : groups.map((gr) => (
        <div key={gr.k}>
          <p className="mgroup">{new Date(gr.k + '-01T00:00').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</p>
          <div className="list">
            {gr.items.map((g) => (
              <div key={g.id} className={`card item grade rise ${tone(g.value)}`} style={{ '--i': Math.min(n++, 8) }}>
                <div className="gval">{fmt(g.value)}</div>
                <div className="grow">
                  <div className="gline"><b>{fdate(g.date)}</b><span className="pill">{g.type}</span></div>
                  {g.note && <p className="muted small">{g.note}</p>}
                  <Bar value={g.value} />
                </div>
                <div className="menuwrap">
                  <button className="icon-btn" aria-label="Opzioni voto" onClick={(e) => { e.stopPropagation(); setMenu(menu === g.id ? null : g.id); }}><MoreVertical size={18} /></button>
                  {menu === g.id && (
                    <div className="menu">
                      <button onClick={() => openEdit(g)}><Pencil size={15} />Modifica voto</button>
                      <button className="red" onClick={() => ask({ title: 'Elimina voto', text: `Eliminare il voto ${fmt(g.value)} del ${fdate(g.date)}? Le medie verranno ricalcolate.`, onOk: () => deleteGrade(g.id) })}><Trash2 size={15} />Elimina voto</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
