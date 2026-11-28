import { Modal } from './ui.jsx';
import { SubjIcon } from './icons.jsx';
import { useStore } from './store.jsx';
import { useFilter, FilterBar } from './Filters.jsx';
import { fmt, fdate, tone, byDate } from './utils';

export default function SearchModal({ onClose, onPick }) {
  const { subjects, allGrades } = useStore(); const f = useFilter();
  const list = f.apply([...allGrades].sort(byDate).reverse(), subjects);
  return (
    <Modal title="Cerca voti" onClose={onClose}>
      <FilterBar f={f} placeholder="Materia, nota o voto…" />
      <p className="muted small">{list.length} {list.length === 1 ? 'risultato' : 'risultati'}{list.length > 40 ? ' (mostro i primi 40)' : ''}</p>
      <div className="list">
        {list.slice(0, 40).map((g) => { const s = subjects.find((x) => x.id === g.subjectId); return s && (
          <button key={g.id} className={`card item grade lastcard ${tone(g.value)}`} onClick={() => onPick(s.id)}>
            <div className="gval">{fmt(g.value)}</div>
            <div className="grow"><div className="gline"><SubjIcon s={s} size={14} /><b>{s.name}</b><span className="pill">{g.type}</span></div><p className="muted small">{fdate(g.date)}{g.note ? ` – ${g.note}` : ''}</p></div>
          </button>); })}
      </div>
    </Modal>
  );
}
