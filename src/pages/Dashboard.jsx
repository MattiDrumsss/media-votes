import { Plus, Settings } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, fmt, tone } from '../utils';
import { Bar, SubjectGrid } from '../ui.jsx';

export default function Dashboard({ go, openAdd }) {
  const { subjects, grades } = useStore();
  const gen = avg(grades);
  return (
    <div>
      <header className="top">
        <img src="/logo.png" className="logo mobile-logo" alt="Media Votes" />
        <div><h1>Bentornato</h1><p className="muted">Ecco come stanno andando i tuoi voti.</p></div>
        <div className="row">
          <button className="icon-btn" onClick={() => go('settings')} aria-label="Impostazioni"><Settings size={20} /></button>
          <button className="btn" onClick={() => openAdd()}><Plus size={18} />AGGIUNGI VOTO</button>
        </div>
      </header>
      <section className="stats">
        <div className={`card hero ${tone(gen)}`}><span className="label">Media generale</span><b className="big">{fmt(gen)}</b><Bar value={gen} /></div>
        <div className="card"><span className="label">Voti totali</span><b className="mid">{grades.length}</b></div>
        <div className="card"><span className="label">Materie attive</span><b className="mid">{subjects.length}</b></div>
      </section>
      <h2>Le mie materie</h2>
      <SubjectGrid go={go} />
    </div>
  );
}
