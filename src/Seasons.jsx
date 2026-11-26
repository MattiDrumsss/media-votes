import { useEffect, useMemo, useState } from 'react';
import { getPref } from './theme';

const SEA = { autunno: ['🍂', '🍁', '🍃'], inverno: ['❄', '❅', '❆'], primavera: ['🌸', '🌼', '🌷'], estate: ['☀', '✨', '🫧'], natale: ['🎄', '❄', '⭐', '🎁'] };
export const seasonOf = (pref, d = new Date()) => {
  if (pref === 'off') return null;
  if (pref !== 'auto') return pref;
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  if (md >= 1215 || md <= 106) return 'natale';
  if (md >= 321 && md <= 620) return 'primavera';
  if (md >= 621 && md <= 922) return 'estate';
  if (md >= 923 && md <= 1220) return 'autunno';
  return 'inverno';
};

export default function Seasons() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); window.addEventListener('mv-pref', f); return () => window.removeEventListener('mv-pref', f); }, []);
  const s = seasonOf(getPref('mv-season', 'auto'));
  const items = useMemo(() => {
    if (!s) return [];
    const n = matchMedia('(max-width: 700px)').matches ? 14 : 26;
    return Array.from({ length: n }, (_, i) => ({ ch: SEA[s][i % SEA[s].length], style: { left: `${Math.random() * 100}%`, fontSize: `${14 + Math.random() * 16}px`, animationDuration: `${9 + Math.random() * 10}s`, animationDelay: `${-Math.random() * 18}s`, '--sw': `${(Math.random() * 2 - 1) * 60}px`, opacity: 0.35 + Math.random() * 0.4 } }));
  }, [s]);
  if (!s) return null;
  return <div className={`seasons s-${s}`} aria-hidden="true">{items.map((p, i) => <span key={i} style={p.style}>{p.ch}</span>)}</div>;
}
