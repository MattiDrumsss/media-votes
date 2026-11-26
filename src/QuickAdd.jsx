import { useEffect, useState } from 'react';
import { X, Check, Pencil, Mic, Hand, SlidersHorizontal } from 'lucide-react';
import { CountUp } from './ui.jsx';
import { SubjIcon } from './icons.jsx';
import { useStore } from './store.jsx';
import { today, fmt } from './utils';
import { getPref, setPref } from './theme';
import { sfx } from './feedback';

const TYPES = [['scritto', 'Scritto', Pencil], ['orale', 'Orale', Mic], ['pratico', 'Pratico', Hand]];
const MODS = [[-0.25, '−', '7− = 6,75'], [0.5, '½', '7½ = 7,5'], [0.25, '+', '7+ = 7,25']];
const lab = (n, m) => (m === 0 || (n === 10 && m > 0) || (n === 1 && m < 0) ? String(n) : n + (m === 0.5 ? '½' : m > 0 ? '+' : '−'));

export default function QuickAdd({ subjectId, onClose, onFull }) {
  const { subjects, saveGrade } = useStore();
  const [sid, setSid] = useState(subjectId || ''); const [type, setT] = useState(getPref('mv-type', 'scritto'));
  const [mod, setMod] = useState(0); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(null);
  useEffect(() => { document.body.classList.add('lock'); return () => document.body.classList.remove('lock'); }, []);
  const cur = subjects.find((s) => s.id === sid);
  const save = async (n) => {
    const v = Math.min(10, Math.max(1, n + mod)); setBusy(true);
    const r = await saveGrade({ subjectId: sid, value: v, date: today(), type, note: '' }); setBusy(false);
    if (r) { sfx('err'); return setErr(r); }
    sfx(v >= 8 ? 'high' : 'ok'); if (v >= 8) window.dispatchEvent(new Event('mv-confetti'));
    setDone({ v, name: cur?.name, color: cur?.color }); setTimeout(onClose, 1500);
  };
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qk" style={{ '--c': (done?.color || cur?.color) || 'var(--p)' }}>
        <button className="icon-btn qk-x" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
        <h3 className="qk-title">Voto rapido</h3>
        <div className="qk-steps">
          <span className={`qk-step ${sid ? 'ok' : 'on'}`}><i>{sid ? <Check size={13} /> : 1}</i>Materia</span><b />
          <span className={`qk-step ${sid ? 'on' : ''}`}><i>2</i>Voto</span>
        </div>
        {done ? (
          <div className="qk-done">
            <div className="qk-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" /><path d="M14 27l8 8 16-17" /></svg></div>
            <div className="qk-bigv"><CountUp value={done.v} /></div>
            <p className="muted">Salvato in {done.name}</p>
          </div>
        ) : !sid ? (
          <>
            <p className="qk-q">Che materia?</p>
            {subjects.length ? <div className="qk-subjects">{subjects.map((s, i) => <button key={s.id} className="qk-tile" style={{ '--c': s.color, '--i': i }} onClick={() => { setSid(s.id); setErr(''); }}><SubjIcon s={s} size={24} /><span>{s.name}</span></button>)}</div> : <p className="muted">Crea prima una materia in Impostazioni.</p>}
          </>
        ) : (
          <>
            <button className="qk-picked" onClick={() => setSid('')}><SubjIcon s={cur} size={22} /><span>{cur?.name}</span><em>Cambia</em></button>
            <p className="qk-q">Che voto hai preso?</p>
            <div className="qk-mods">
              <span className="muted small">Sfumatura</span>
              {MODS.map(([m, l]) => <button key={m} className={mod === m ? 'on' : ''} onClick={() => setMod(mod === m ? 0 : m)} aria-label={l}>{l}</button>)}
              <span className="muted small qk-hint">{mod === 0 ? 'nessuna' : MODS.find((x) => x[0] === mod)[2]}</span>
            </div>
            <div className="qk-pad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => <button key={n} disabled={busy} style={{ '--i': i }} className={`qk-n ${n < 6 ? 'low' : n === 6 ? 'mid' : 'high'}`} onClick={() => save(n)}>{lab(n, mod)}</button>)}</div>
            <div className="qk-types">{TYPES.map(([k, l, I]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => { setT(k); setPref('mv-type', k); }}><I size={15} />{l}</button>)}</div>
          </>
        )}
        {err && <p className="err">{err}</p>}
        {!done && <button className="qk-more" onClick={() => onFull({ subjectId: sid || undefined })}><SlidersHorizontal size={14} />Più opzioni (data e note)</button>}
      </div>
    </div>
  );
}
