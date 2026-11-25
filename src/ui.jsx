import { useEffect, useRef, useState } from 'react';
import { X, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStore } from './store.jsx';
import { avg, fmt, tone, toneLabel, trendOf, byDate, PERIODS } from './utils';
import { SubjIcon } from './icons.jsx';

export const Bar = ({ value }) => <div className="bar"><i style={{ width: `${value ? value * 10 : 0}%` }} /></div>;

export function CountUp({ value, dec = 2 }) {
  const [v, setV] = useState(0); const from = useRef(0);
  useEffect(() => {
    if (value == null) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(value); from.current = value; return; }
    const s = from.current, t0 = performance.now(); let raf;
    const step = (t) => { const k = Math.min(1, (t - t0) / 800); const x = s + (value - s) * (1 - Math.pow(1 - k, 3)); setV(x); from.current = x; if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [value]);
  return value == null ? '—' : v.toFixed(dec).replace('.', ',');
}

export const TrendIcon = ({ t }) => (t === 'up' ? <TrendingUp size={20} className="tr up" /> : t === 'down' ? <TrendingDown size={20} className="tr down" /> : t === 'flat' ? <Minus size={20} className="tr flat" /> : null);

export function PeriodBar() {
  const { pf, setPf, mode } = useStore(); const n = PERIODS[mode].short;
  return <div className="seg chips">{[['all', 'Tutto'], [1, n[0]], [2, n[1]]].map(([k, l]) => <button key={k} className={pf === k ? 'on' : ''} onClick={() => setPf(k)}>{l}</button>)}</div>;
}

export const Splash = ({ hide }) => <div className={`splash ${hide ? 'hide' : ''}`}><img src="/logo.png" className="logo splash-logo" alt="" /><div className="loadbar"><i /></div></div>;

export function Modal({ title, onClose, children }) {
  useEffect(() => { document.body.classList.add('lock'); return () => document.body.classList.remove('lock'); }, []);
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

export const TC = { high: '#34d399', mid: '#fbbf24', low: '#f87171', none: '#8b86a3' };

export function Ring({ value, t, size = 84, stroke = 8, children }) {
  const [m, setM] = useState(false);
  useEffect(() => { const x = setTimeout(() => setM(true), 60); return () => clearTimeout(x); }, []);
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - (value ? value / 10 : 0));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,160,.2)" strokeWidth={stroke} />
        <circle className="ringfg" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" style={{ color: TC[t] }} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={m ? off : c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="ringval">{children}</span>
    </div>
  );
}

export function SubjectGrid({ go }) {
  const { subjects, grades } = useStore();
  if (!subjects.length) return <div className="card empty">Non hai ancora materie. Creale in Impostazioni.</div>;
  return (
    <div className="grid">
      {subjects.map((s, i) => {
        const gs = grades.filter((g) => g.subjectId === s.id);
        const a = avg(gs); const t = tone(a); const last = [...gs].sort(byDate).pop();
        return (
          <button key={s.id} className={`card subj rise ${t}`} style={{ '--i': i, '--c': s.color }} onClick={() => go('detail', s.id)}>
            <div className="head"><SubjIcon s={s} /><span className="subjname">{s.name}</span><ChevronRight size={18} className="muted" /></div>
            <div className="body">
              <Ring value={a} t={t}><CountUp value={a} /></Ring>
              <div className="meta">
                <span className="pill">{toneLabel[t]}</span>
                <span className="muted small">{gs.length} {gs.length === 1 ? 'voto' : 'voti'}{last ? ` – ultimo ${fmt(last.value)}` : ''}</span>
                <TrendIcon t={trendOf(gs)} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
