import { X, ChevronRight } from 'lucide-react';
import { useStore } from './store.jsx';
import { avg, fmt, tone, toneLabel } from './utils';

export const Bar = ({ value }) => <div className="bar"><i style={{ width: `${value ? value * 10 : 0}%` }} /></div>;

export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal card">
        <div className="mh"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Chiudi"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({ c, onClose }) {
  return (
    <Modal title={c.title} onClose={onClose}>
      <p className="muted">{c.text}</p>
      <div className="actions">
        <button className="btn ghost" onClick={onClose}>Annulla</button>
        <button className="btn danger" onClick={() => { c.onOk(); onClose(); }}>{c.ok || 'Elimina'}</button>
      </div>
    </Modal>
  );
}

export function SubjectGrid({ go }) {
  const { subjects, grades } = useStore();
  if (!subjects.length) return <div className="card empty">Non hai ancora materie. Creale in Impostazioni.</div>;
  return (
    <div className="grid">
      {subjects.map((s) => {
        const gs = grades.filter((g) => g.subjectId === s.id);
        const a = avg(gs); const t = tone(a);
        return (
          <button key={s.id} className={`card subj ${t}`} onClick={() => go('detail', s.id)}>
            <div className="row between"><b>{s.name}</b><ChevronRight size={18} className="muted" /></div>
            <div className="avg">{fmt(a)}</div>
            <Bar value={a} />
            <div className="row between small"><span className="muted">{gs.length} {gs.length === 1 ? 'voto' : 'voti'}</span><span className="pill">{toneLabel[t]}</span></div>
          </button>
        );
      })}
    </div>
  );
}
