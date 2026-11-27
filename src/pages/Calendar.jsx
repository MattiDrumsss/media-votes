import { Trash2, CalendarPlus } from 'lucide-react';
import { useStore } from '../store.jsx';
import { fdate, daysUntil, dayLabel, byDate } from '../utils';
import { SubjIcon } from '../icons.jsx';

export function EventRow({ e, compact, onRegister, onDelete }) {
  const { subjects } = useStore(); const s = subjects.find((x) => x.id === e.subjectId); if (!s) return null;
  const n = daysUntil(e.date);
  return (
    <div className={`card event rise ${n < 0 ? 'past' : ''}`}>
      <SubjIcon s={s} />
      <div className="grow"><b>{s.name}</b> <span className="pill">{e.kind}</span><p className="muted small">{fdate(e.date)} – {dayLabel(n)}{e.note ? ` – ${e.note}` : ''}</p></div>
      {!compact && n <= 0 && <button className="btn ghost sm" onClick={onRegister}>Registra voto</button>}
      {!compact && <button className="icon-btn red" onClick={onDelete} aria-label="Elimina"><Trash2 size={17} /></button>}
    </div>
  );
}

export default function Calendar({ openAdd, openEvent, ask }) {
  const { events, deleteEvent } = useStore();
  const sorted = [...events].sort(byDate);
  const up = sorted.filter((e) => daysUntil(e.date) >= 0); const past = sorted.filter((e) => daysUntil(e.date) < 0).reverse();
  const row = (e) => <EventRow key={e.id} e={e} onRegister={() => openAdd(e.subjectId, e.id)} onDelete={() => ask({ title: 'Elimina prova', text: 'Vuoi eliminare questa prova dal calendario?', onOk: () => deleteEvent(e.id) })} />;
  return (
    <div>
      <header className="top"><div><h1>Verifiche</h1><p className="muted">Per aggiungerne una usa il pulsante +.</p></div><button className="btn" onClick={openEvent}><CalendarPlus size={18} />AGGIUNGI VERIFICA</button></header>
      <h2>In arrivo</h2>
      {up.length ? <div className="list">{up.map(row)}</div> : <div className="card empty">Nessuna prova in programma.</div>}
      {past.length > 0 && <><h2>Passate, senza voto</h2><div className="list">{past.map(row)}</div></>}
    </div>
  );
}
