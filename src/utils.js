export const avg = (a) => (a.length ? a.reduce((s, v) => s + v.value, 0) / a.length : null);
export const fmt = (n) => (n == null ? '—' : n.toFixed(2).replace('.', ','));
export const tone = (n) => (n == null ? 'none' : n >= 7 ? 'high' : n >= 6 ? 'mid' : 'low');
export const toneLabel = { high: 'Ottima', mid: 'Sufficiente', low: 'Insufficiente', none: 'Nessun voto' };
export const today = () => new Date().toLocaleDateString('en-CA');
export const fdate = (d) => new Date(d + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const byDate = (a, b) => a.date.localeCompare(b.date);
