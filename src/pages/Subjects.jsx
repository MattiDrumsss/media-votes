import { SubjectGrid } from '../ui.jsx';
export default function Subjects({ go }) {
  return <div><header className="top"><div><h1>Materie</h1><p className="muted">Tocca una materia per vedere i dettagli.</p></div></header><SubjectGrid go={go} /></div>;
}
