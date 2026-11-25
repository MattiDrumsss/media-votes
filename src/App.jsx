import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, BarChart3, Settings as Cog, Plus, CalendarDays, LayoutGrid } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetail from './pages/SubjectDetail.jsx';
import Calendar from './pages/Calendar.jsx';
import Heatmap from './pages/Heatmap.jsx';
import Stats from './pages/Stats.jsx';
import Settings from './pages/Settings.jsx';
import GradeForm from './GradeForm.jsx';
import Auth from './Auth.jsx';
import { Confirm, Splash } from './ui.jsx';
import { useStore } from './store.jsx';
import { configured } from './supabase';

const NAV = [['dashboard', 'Dashboard', LayoutDashboard, 'Home'], ['subjects', 'Materie', BookOpen, 'Materie'], ['calendar', 'Verifiche', CalendarDays, 'Verifiche'], ['heatmap', 'Mappa dei voti', LayoutGrid, 'Mappa'], ['stats', 'Statistiche', BarChart3, 'Stats'], ['settings', 'Impostazioni', Cog, 'Impost.']];
const PAGES = { dashboard: Dashboard, subjects: Subjects, detail: SubjectDetail, calendar: Calendar, heatmap: Heatmap, stats: Stats, settings: Settings };

function Shell() {
  const { error, loading } = useStore();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [form, setForm] = useState(null);
  const [conf, setConf] = useState(null);
  const go = (page, id = null) => { setRoute({ page, id }); window.scrollTo(0, 0); };
  const ui = { go, openAdd: (subjectId, eventId) => setForm({ subjectId, eventId }), openEdit: (grade) => setForm({ grade }), ask: setConf };
  const active = route.page === 'detail' ? 'subjects' : route.page;
  const idx = Math.max(0, NAV.findIndex((n) => n[0] === active));
  const Page = PAGES[route.page];
  return (
    <div className="shell">
      <aside className="side">
        <img src="/logo.png" className="logo" alt="Media Votes" />
        <nav>{NAV.map(([k, l, I]) => <button key={k} className={active === k ? 'on' : ''} onClick={() => go(k)}><I size={19} />{l}</button>)}</nav>
        <button className="btn" onClick={() => ui.openAdd()}><Plus size={18} />AGGIUNGI VOTO</button>
      </aside>
      <main>
        {error && <div className="card err">{error}</div>}
        {loading ? <p className="muted">Caricamento…</p> : <div className="page" key={route.page + route.id}><Page {...ui} id={route.id} /></div>}
      </main>
      <nav className="tabs" style={{ '--idx': idx, '--n': NAV.length }}>
        <span className="glass-ind" />
        {NAV.map(([k, l, I, s]) => <button key={k} className={active === k ? 'on' : ''} onClick={() => go(k)} aria-label={l}><I size={20} /><span>{s}</span></button>)}
      </nav>
      <button className="fab" onClick={() => ui.openAdd()} aria-label="Aggiungi voto"><Plus size={26} /></button>
      {form && <GradeForm {...form} onClose={() => setForm(null)} />}
      {conf && <Confirm c={conf} onClose={() => setConf(null)} />}
    </div>
  );
}

export default function App() {
  const { session } = useStore();
  const [min, setMin] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMin(true), 1700); return () => clearTimeout(t); }, []);
  const waiting = configured && session === undefined;
  let body = null;
  if (!configured) body = <div className="authwrap"><div className="card auth"><h3>Configurazione mancante</h3><p className="muted">Aggiungi SUPABASE_URL e SUPABASE_ANON_KEY nelle variabili d'ambiente e pubblica di nuovo.</p></div></div>;
  else if (!waiting) body = session ? <Shell /> : <Auth />;
  return <><Splash hide={min && !waiting} />{body}</>;
}
