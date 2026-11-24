import { Plus, Settings, Flame } from 'lucide-react';
import { useStore } from '../store.jsx';
import { avg, tone, daysUntil, byDate } from '../utils';
import { achievements } from '../achievements';
import { Bar, SubjectGrid, PeriodBar, CountUp } from '../ui.jsx';
import { EventRow } from './Calendar.jsx';

export default function Dashboard({ go, openAdd }) {
  const { subjects, grades, allGrades, events } = useStore();
  const gen = avg(grades); const { streak } = achievements(allGrades, subjects);
  const next = [...events].filter((e) => daysUntil(e.date) >= 0).sort(byDate).slice(0, 3);
  return (
    <div>
      <header className="top">
        <img src="/logo.png" className="logo mobile-logo" alt="Media Votes" />
        <div><h1>Bentornato</h1><p className="muted">Ecco come stanno andando i tuoi voti.</p></div>
        <div className="row">
          {streak > 0 && <span className="streak"><Flame size={16} />{streak}</span>}
          <button className="icon-btn" onClick={() => go('settings')} aria-label="Impostazioni"><Settings size={20} /></button>
          <button className="btn" onClick={() => openAdd()}><Plus size={18} />AGGIUNGI VOTO</button>
        </div>
      </header>
      <PeriodBar />
      <section className="stats">
        <div className={`card hero rise ${tone(gen)}`}><span className="label">Media generale</span><b className="big"><CountUp value={gen} /></b><Bar value={gen} /></div>
        <div className="card rise" style={{ '--i': 1 }}><span className="label">Voti totali</span><b className="mid"><CountUp value={grades.length} dec={0} /></b></div>
        <div className="card rise" style={{ '--i': 2 }}><span className="label">Materie attive</span><b className="mid"><CountUp value={subjects.length} dec={0} /></b></div>
      </section>
      {next.length > 0 && <><h2>Prossime verifiche</h2><div className="list">{next.map((e) => <EventRow key={e.id} e={e} compact />)}</div></>}
      <h2>Le mie materie</h2>
      <SubjectGrid go={go} />
    </div>
  );
}
