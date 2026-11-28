import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store.jsx';
import App from './App.jsx';
import './styles.css';
import { applyTheme } from './theme';
import { sfx } from './feedback';
applyTheme();
matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
createRoot(document.getElementById('root')).render(<StoreProvider><App /></StoreProvider>);

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

if (matchMedia('(hover: hover)').matches) document.addEventListener('pointermove', (e) => { const c = e.target.closest?.('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); } });
document.addEventListener('click', (e) => { if (e.target.closest?.('button, a, select')) sfx('tap'); });

document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest?.('.btn, .icon-btn, .qk-n, .qk-tile, .qk-d, .chiprow button, .seg button'); if (!t || t.disabled) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span');
  s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
  t.style.overflow = 'hidden'; t.appendChild(s); setTimeout(() => s.remove(), 650);
});
if (matchMedia('(hover: hover)').matches) {
  document.addEventListener('pointermove', (e) => { const c = e.target.closest?.('.subj'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`); c.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`); });
  document.addEventListener('pointerout', (e) => { const c = e.target.closest?.('.subj'); if (c && !e.relatedTarget?.closest?.('.subj')) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
}
