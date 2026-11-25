export const ACCENTS = { viola: ['#a855f7', '#7c3aed'], blu: ['#3b82f6', '#1d4ed8'], verde: ['#10b981', '#047857'], rosa: ['#ec4899', '#be185d'], arancio: ['#f59e0b', '#d97706'] };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
export const getPref = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
export const setPref = (k, v) => { try { localStorage.setItem(k, v); } catch {} applyTheme(); };
export function applyTheme() {
  const t = getPref('mv-theme', 'dark');
  const light = t === 'light' || (t === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
  const [p, p2] = ACCENTS[getPref('mv-accent', 'viola')] || ACCENTS.viola;
  const r = document.documentElement;
  r.dataset.theme = light ? 'light' : 'dark';
  r.style.setProperty('--p', p); r.style.setProperty('--p2', p2);
  r.style.setProperty('--pr', rgb(p)); r.style.setProperty('--p2r', rgb(p2));
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', light ? '#f4f2fb' : '#0a0912');
}
export const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--p').trim() || '#a855f7';
export const acc2 = () => getComputedStyle(document.documentElement).getPropertyValue('--p2').trim() || '#7c3aed';
