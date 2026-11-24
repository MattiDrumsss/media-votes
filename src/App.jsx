import { useState } from 'react';
import { LayoutDashboard, BookOpen, BarChart3, Settings as Cog, Plus } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import Stats from './pages/Stats.jsx';
import Settings from './pages/Settings.jsx';
import GradeForm from './GradeForm.jsx';
import { Confirm } from './ui.jsx';
import Auth from './Auth.jsx';
import { useStore } from './store.jsx';
import { configured } from './supabase';

const NAV = [['dashboard', 'Dashboard', LayoutDashboard], ['subjects', 'Materie', BookOpen], ['stats', 'Statistiche', BarChart3], ['settings', 'Impostazioni', Cog]];

function Shell() {
  const { error, loading } = useStore();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [form, setForm] = useState(null);
  const [conf, setConf] = useState(null);
  const go = (page, id = null) => { setRoute({ page, id }); window.scrollTo(0, 0); };
  const ui = { go, openAdd: (subjectId) => setForm({ subjectId }), openEdit: (grade) => setForm({ grade }), ask: setConf };
  const active = route.page === 'detail' ? 'subjects' : route.page;
  const Page = { dashboard: Dashboard, subjects: Subjects, detail: SubjectDetail, stats: Stats, settings: Settings }[route.page];
  return (
    <div className="shell">
      <aside className="side">
        <img src="/logo.png" className="logo" alt="Media Votes" />
        <nav>{NAV.map(([k, l, I]) => <button key={k} className={active === k ? 'on' : ''} onClick={() => go(k)}><I size={19} />{l}</button>)}</nav>
        <button className="btn" onClick={() => ui.openAdd()}><Plus size={18} />AGGIUNGI VOTO</button>
      </aside>
      <main>{error && <div className="card err">{error}</div>}{loading ? <p className="muted">Caricamento…</p> : <Page {...ui} id={route.id} />}</main>
      <nav className="tabs">{NAV.map(([k, l, I]) => <button key={k} className={active === k ? 'on' : ''} onClick={() => go(k)}><I size={20} /><span>{l}</span></button>)}</nav>
      <button className="fab" onClick={() => ui.openAdd()} aria-label="Aggiungi voto"><Plus size={26} /></button>
      {form && <GradeForm {...form} onClose={() => setForm(null)} />}
      {conf && <Confirm c={conf} onClose={() => setConf(null)} />}
    </div>
  );
}

export default function App() {
  const { session } = useStore();
  if (!configured) return <div className="authwrap"><div className="card auth"><h3>Configurazione mancante</h3><p className="muted">Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nelle variabili d'ambiente e pubblica di nuovo.</p></div></div>;
  if (session === undefined) return <div className="authwrap"><p className="muted">Caricamento…</p></div>;
  return session ? <Shell /> : <Auth />;
}
