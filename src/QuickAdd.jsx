import { useState } from 'react';
import { Modal } from './ui.jsx';
import { SubjIcon } from './icons.jsx';
import { useStore } from './store.jsx';
import { today, fmt } from './utils';
import { getPref, setPref } from './theme';
import { sfx } from './feedback';

const MODS = [[0, 'Intero'], [-0.25, '−'], [0.5, '½'], [0.25, '+']];
const lab = (n, m) => (m === 0 || (n === 10 && m > 0) || (n === 1 && m < 0) ? String(n) : n + (m === 0.5 ? '½' : m > 0 ? '+' : '−'));

export default function QuickAdd({ subjectId, onClose, onFull }) {
  const { subjects, saveGrade } = useStore();
  const [sid, setSid] = useState(subjectId || ''); const [type, setT] = useState(getPref('mv-type', 'scritto'));
  const [mod, setMod] = useState(0); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const save = async (n) => {
    if (!sid) { sfx('err'); return setErr('Scegli prima la materia.'); }
    const v = Math.min(10, Math.max(1, n + mod)); setBusy(true);
    const r = await saveGrade({ subjectId: sid, value: v, date: today(), type, note: '' }); setBusy(false);
    if (r) { sfx('err'); return setErr(r); }
    sfx(v >= 8 ? 'high' : 'ok'); if (v >= 8) window.dispatchEvent(new Event('mv-confetti'));
    window.dispatchEvent(new CustomEvent('mv-toast', { detail: `Salvato ${fmt(v)} in ${subjects.find((x) => x.id === sid)?.name}` }));
    onClose();
  };
  return (
    <Modal title="Voto rapido" onClose={onClose}>
      <div className="qa">
        <span className="label">1. Scegli la materia</span>
        <div className="qchips">{subjects.map((s) => <button key={s.id} type="button" className={`qchip ${sid === s.id ? 'on' : ''}`} style={{ '--c': s.color }} onClick={() => { setSid(s.id); setErr(''); }}><SubjIcon s={s} size={16} />{s.name}</button>)}</div>
        <span className="label">Tipo di prova</span>
        <div className="seg three">{[['scritto', 'Scritto'], ['orale', 'Orale'], ['pratico', 'Pratico']].map(([k, l]) => <button key={k} type="button" className={type === k ? 'on' : ''} onClick={() => { setT(k); setPref('mv-type', k); }}>{l}</button>)}</div>
        <span className="label">Sfumatura (7+ = 7,25 – 7½ = 7,5 – 8− = 7,75)</span>
        <div className="seg four">{MODS.map(([m, l]) => <button key={m} type="button" className={mod === m ? 'on' : ''} onClick={() => setMod(m)}>{l}</button>)}</div>
        <span className="label">2. Tocca il voto: si salva subito</span>
        <div className="qgrid">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <button key={n} type="button" disabled={busy} className={`qnum ${n < 6 ? 'low' : n === 6 ? 'mid' : 'high'}`} onClick={() => save(n)}>{lab(n, mod)}</button>)}</div>
        {err && <p className="err">{err}</p>}
        <button className="btn ghost" type="button" onClick={() => onFull({ subjectId: sid || undefined })}>Più opzioni (data e note)</button>
      </div>
    </Modal>
  );
}
