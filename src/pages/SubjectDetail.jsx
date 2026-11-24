import { useState } from 'react';
import { ArrowLeft, MoreVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, fmt, tone, toneLabel, fdate, byDate } from '../utils';
import { Trend, gradeSeries } from '../charts.jsx';

export default function SubjectDetail({ id, go, openAdd, openEdit, ask }) {
  const { subjects, grades, deleteGrade } = useStore();
  const [menu, setMenu] = useState(null);
  const s = subjects.find((x) => x.id === id);
  if (!s) return <div className="card empty">Materia non trovata. <button className="btn ghost" onClick={() => go('subjects')}>Torna alle materie</button></div>;
  const gs = grades.filter((g) => g.subjectId === id);
  const a = avg(gs); const vals = gs.map((g) => g.value);
  const list = [...gs].sort(byDate).reverse();
  return (
    <div onClick={() => setMenu(null)}>
      <header className="top">
        <div className="row"><button className="icon-btn" onClick={() => go('subjects')} aria-label="Indietro"><ArrowLeft size={20} /></button><h1>{s.name}</h1></div>
        <button className="btn" onClick={() => openAdd(id)}><Plus size={18} />AGGIUNGI VOTO</button>
      </header>
      <section className="stats four">
        <div className={`card hero ${tone(a)}`}><span className="label">Media</span><b className="big">{fmt(a)}</b><span className="pill">{toneLabel[tone(a)]}</span></div>
        <div className="card"><span className="label">Voti</span><b className="mid">{gs.length}</b></div>
        <div className="card"><span className="label">Più alto</span><b className="mid">{gs.length ? fmt(Math.max(...vals)) : '—'}</b></div>
        <div className="card"><span className="label">Più basso</span><b className="mid">{gs.length ? fmt(Math.min(...vals)) : '—'}</b></div>
      </section>
      <h2>Andamento</h2>
      <div className="card"><Trend data={gradeSeries(gs)} name={s.name} /></div>
      <h2>Tutti i voti</h2>
      {!list.length ? <div className="card empty">Nessun voto in questa materia.</div> : (
        <div className="list">
          {list.map((g) => (
            <div key={g.id} className="card item">
              <div className={`val ${tone(g.value)}`}>{fmt(g.value)}</div>
              <div className="grow"><b>{fdate(g.date)}</b> <span className="pill">{g.type}</span>{g.note && <p className="muted small">{g.note}</p>}</div>
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
      )}
    </div>
  );
}
