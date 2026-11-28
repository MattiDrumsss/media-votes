import { Search } from 'lucide-react';
import { PeriodBar, SubjectGrid } from '../ui.jsx';
export default function Subjects({ go, openSearch }) {
  return <div><header className="top"><div><h1>Materie</h1><p className="muted">Tocca una materia per vedere i dettagli.</p></div><button className="icon-btn" onClick={openSearch} aria-label="Cerca voti"><Search size={20} /></button></header><PeriodBar /><SubjectGrid go={go} /></div>;
}
