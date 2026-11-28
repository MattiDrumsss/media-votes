import { useState } from 'react';
import { Search, X } from 'lucide-react';

const LV = [['tutti', 'Tutti i voti'], ['low', 'Sotto il 6'], ['mid', '6–7'], ['high', '7–8'], ['top', '8 o più']];
const TY = [['tutti', 'Tutte le prove'], ['scritto', 'Scritto'], ['orale', 'Orale'], ['pratico', 'Pratico']];
const inLv = (v, k) => k === 'tutti' || (k === 'low' ? v < 6 : k === 'mid' ? v >= 6 && v < 7 : k === 'high' ? v >= 7 && v < 8 : v >= 8);

export function useFilter() {
  const [q, setQ] = useState(''); const [type, setType] = useState('tutti'); const [lv, setLv] = useState('tutti');
  const active = q.trim() !== '' || type !== 'tutti' || lv !== 'tutti';
  const reset = () => { setQ(''); setType('tutti'); setLv('tutti'); };
  const apply = (gs, subjects) => {
    const t = q.trim().toLowerCase();
    return gs.filter((g) => (type === 'tutti' || g.type === type) && inLv(g.value, lv) && (!t || (g.note || '').toLowerCase().includes(t) || String(g.value).replace('.', ',').includes(t) || (subjects && (subjects.find((s) => s.id === g.subjectId)?.name || '').toLowerCase().includes(t))));
  };
  return { q, setQ, type, setType, lv, setLv, active, reset, apply };
}

export function FilterBar({ f, placeholder = 'Cerca nelle note…' }) {
  return (
    <div className="fbar">
      <div className="fsearch"><Search size={16} /><input value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder={placeholder} />{f.q && <button onClick={() => f.setQ('')} aria-label="Cancella"><X size={14} /></button>}</div>
      <div className="chiprow">{TY.map(([k, l]) => <button key={k} className={f.type === k ? 'on' : ''} onClick={() => f.setType(k)}>{l}</button>)}</div>
      <div className="chiprow">{LV.map(([k, l]) => <button key={k} className={f.lv === k ? 'on' : ''} onClick={() => f.setLv(k)}>{l}</button>)}</div>
      {f.active && <button className="btn ghost sm" onClick={f.reset}>Azzera filtri</button>}
    </div>
  );
}
