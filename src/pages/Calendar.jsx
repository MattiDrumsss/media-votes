import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store.jsx';
import { today, fdate, daysUntil, dayLabel, byDate } from '../utils';
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

export default function Calendar({ openAdd, ask }) {
  const { subjects, events, addEvent, deleteEvent } = useStore();
  const [f, setF] = useState({ subjectId: '', date: today(), kind: 'verifica', note: '' }); const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sid = f.subjectId || subjects[0]?.id;
  const submit = async (e) => {
    e.preventDefault(); if (!sid) return setErr('Crea prima una materia in Impostazioni.');
    const r = await addEvent({ ...f, subjectId: sid }); setErr(r || ''); if (!r) setF({ ...f, note: '' });
  };
  const sorted = [...events].sort(byDate);
  const up = sorted.filter((e) => daysUntil(e.date) >= 0); const past = sorted.filter((e) => daysUntil(e.date) < 0).reverse();
  const row = (e) => <EventRow key={e.id} e={e} onRegister={() => openAdd(e.subjectId, e.id)} onDelete={() => ask({ title: 'Elimina prova', text: 'Vuoi eliminare questa prova dal calendario?', onOk: () => deleteEvent(e.id) })} />;
  return (
    <div>
      <header className="top"><div><h1>Verifiche</h1><p className="muted">Segna le prove in arrivo e registra il voto quando arriva.</p></div></header>
      <form className="card form" onSubmit={submit}>
        <div className="two">
          <label>Materia<select value={sid || ''} onChange={set('subjectId')}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Tipo<select value={f.kind} onChange={set('kind')}><option value="verifica">Verifica</option><option value="interrogazione">Interrogazione</option></select></label>
        </div>
        <div className="two">
          <label>Data<input type="date" value={f.date} onChange={set('date')} required /></label>
          <label>Note (facoltativo)<input placeholder="es. capitolo 4" value={f.note} onChange={set('note')} /></label>
        </div>
        {err && <p className="err">{err}</p>}
        <button className="btn" type="submit">AGGIUNGI AL CALENDARIO</button>
      </form>
      <h2>In arrivo</h2>
      {up.length ? <div className="list">{up.map(row)}</div> : <div className="card empty">Nessuna prova in programma.</div>}
      {past.length > 0 && <><h2>Passate, senza voto</h2><div className="list">{past.map(row)}</div></>}
    </div>
  );
}
