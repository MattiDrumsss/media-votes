import { useState } from 'react';
import { Modal } from './ui.jsx';
import { useStore } from './store.jsx';
import { today } from './utils';

export default function GradeForm({ grade, subjectId, eventId, onClose }) {
  const { subjects, saveGrade, deleteEvent } = useStore();
  const [f, setF] = useState({
    value: grade ? String(grade.value).replace('.', ',') : '',
    subjectId: grade?.subjectId || subjectId || subjects[0]?.id || '',
    date: grade?.date || today(), type: grade?.type || 'scritto', note: grade?.note || '',
  });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const v = parseFloat(f.value.replace(',', '.'));
    if (!(v >= 1 && v <= 10)) return setErr('Il voto deve essere compreso tra 1 e 10.');
    if (!f.subjectId) return setErr('Crea prima una materia in Impostazioni.');
    const r = await saveGrade({ ...(grade || {}), value: Math.round(v * 100) / 100, subjectId: f.subjectId, date: f.date || today(), type: f.type, note: f.note.trim() });
    if (r) return setErr(r);
    if (eventId) await deleteEvent(eventId);
    onClose();
  };
  return (
    <Modal title={grade ? 'Modifica voto' : 'Aggiungi voto'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label>Voto<input inputMode="decimal" placeholder="es. 7,5" value={f.value} onChange={set('value')} /></label>
        <label>Materia<select value={f.subjectId} onChange={set('subjectId')}>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <div className="two">
          <label>Data<input type="date" value={f.date} onChange={set('date')} /></label>
          <label>Tipo di prova<select value={f.type} onChange={set('type')}><option value="scritto">Scritto</option><option value="orale">Orale</option><option value="pratico">Pratico</option></select></label>
        </div>
        <label>Note (facoltativo)<input placeholder="es. verifica capitolo 3" value={f.note} onChange={set('note')} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn" type="submit">SALVA VOTO</button>
      </form>
    </Modal>
  );
}
