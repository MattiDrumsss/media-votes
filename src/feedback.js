import { getPref } from './theme';
let ctx;
const on = (k) => getPref(k, 'on') === 'on';
function note(freq, t0, dur, type = 'sine', vol = 0.08) {
  const c = ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
export function sfx(name) {
  if (on('mv-vibe') && navigator.vibrate) navigator.vibrate({ tap: 8, ok: [12, 40, 18], high: [15, 40, 15, 40, 40], err: [40] }[name] || 8);
  if (!on('mv-sound')) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (name === 'tap') note(880, 0, 0.05, 'triangle', 0.03);
    if (name === 'ok') { note(660, 0, 0.12); note(880, 0.09, 0.18); }
    if (name === 'high') [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.09, 0.22, 'triangle', 0.07));
    if (name === 'err') note(180, 0, 0.18, 'sawtooth', 0.05);
  } catch { /* audio non disponibile */ }
}
