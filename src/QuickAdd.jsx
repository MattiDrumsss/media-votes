import { useEffect, useState } from 'react';
import { X, Check, Pencil, Mic, Hand, Sun, History, CalendarDays, ArrowLeft, Save } from 'lucide-react';
import { CountUp } from './ui.jsx';
import { SubjIcon } from './icons.jsx';
import { useStore } from './store.jsx';
import { today } from './utils';
import { getPref, setPref } from './theme';
import { sfx } from './feedback';

const STEPS = ['Materia', 'Voto', 'Data', 'Dettagli'];
const TYPES = [['scritto', 'Scritto', Pencil], ['orale', 'Orale', Mic], ['pratico', 'Pratico', Hand]];
const MODS = [[-0.25, '−', '7− = 6,75'], [0.5, '½', '7½ = 7,5'], [0.25, '+', '7+ = 7,25']];
const lab = (n, m) => (m === 0 || (n === 10 && m > 0) || (n === 1 && m < 0) ? String(n) : n + (m === 0.5 ? '½' : m > 0 ? '+' : '−'));
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString('en-CA'); };
const short = (d) => new Date(d + 'T00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const fv = (v) => String(v).replace('.', ',');

export default function QuickAdd({ subjectId, onClose }) {
  const { subjects, saveGrade } = useStore();
  const [step, setStep] = useState(subjectId ? 1 : 0); const [sid, setSid] = useState(subjectId || '');
  const [num, setNum] = useState(null); const [mod, setMod] = useState(0);
  const [date, setDate] = useState(today()); const [dmode, setDmode] = useState('oggi');
  const [type, setT] = useState(getPref('mv-type', 'scritto')); const [note, setNote] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(null);
  useEffect(() => { document.body.classList.add('lock'); return () => document.body.classList.remove('lock'); }, []);
  const cur = subjects.find((s) => s.id === sid);
  const value = num == null ? null : Math.min(10, Math.max(1, num + mod));
  const dlabel = dmode === 'oggi' ? 'Oggi' : dmode === 'ieri' ? 'Ieri' : short(date);
  const go = (s) => { setStep(s); setErr(''); };
  const pickDate = (mode, d) => { setDmode(mode); setDate(d); go(3); };
  const save = async () => {
    setBusy(true);
    const r = await saveGrade({ subjectId: sid, value, date: date || today(), type, note: note.trim() }); setBusy(false);
    if (r) { sfx('err'); return setErr(r); }
    sfx(value >= 8 ? 'high' : 'ok'); if (value >= 8) window.dispatchEvent(new Event('mv-confetti'));
    setDone({ v: value, name: cur?.name, color: cur?.color }); setTimeout(onClose, 1500);
  };
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qk" style={{ '--c': (done?.color || cur?.color) || 'var(--p)' }}>
        <button className="icon-btn qk-x" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
        <h3 className="qk-title">Nuovo voto</h3>
        <div className="qk-steps">
          {STEPS.map((l, i) => (
            <span key={l} className="qk-st">
              {i > 0 && <b />}
              <button className={`qk-step ${done || i < step ? 'ok' : i === step ? 'on' : ''}`} disabled={done || i >= step} onClick={() => go(i)}><i>{done || i < step ? <Check size={13} /> : i + 1}</i><span className="lbl">{l}</span></button>
            </span>
          ))}
        </div>
        {done ? (
          <div className="qk-done">
            <div className="qk-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" /><path d="M14 27l8 8 16-17" /></svg></div>
            <div className="qk-bigv"><CountUp value={done.v} /></div>
            <p className="muted">Salvato in {done.name}</p>
          </div>
        ) : (
          <div key={step} className="qk-slide">
            {step === 0 && (<>
              <p className="qk-q">Che materia?</p>
              {subjects.length ? <div className="qk-subjects">{subjects.map((s, i) => <button key={s.id} className={`qk-tile ${sid === s.id ? 'sel' : ''}`} style={{ '--c': s.color, '--i': i }} onClick={() => { setSid(s.id); go(1); }}><SubjIcon s={s} size={24} /><span>{s.name}</span></button>)}</div> : <p className="muted">Crea prima una materia in Impostazioni.</p>}
            </>)}
            {step === 1 && (<>
              <button className="qk-picked" onClick={() => go(0)}><SubjIcon s={cur || { icon: 'book' }} size={22} /><span>{cur?.name}</span><em>Cambia</em></button>
              <p className="qk-q">Che voto hai preso?</p>
              <div className="qk-mods">
                <span className="muted small">Sfumatura</span>
                {MODS.map(([m, l]) => <button key={m} className={mod === m ? 'on' : ''} onClick={() => setMod(mod === m ? 0 : m)} aria-label={l}>{l}</button>)}
                <span className="muted small qk-hint">{mod === 0 ? 'nessuna' : MODS.find((x) => x[0] === mod)[2]}</span>
              </div>
              <div className="qk-pad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => <button key={n} style={{ '--i': i }} className={`qk-n ${n < 6 ? 'low' : n === 6 ? 'mid' : 'high'} ${num === n ? 'on' : ''}`} onClick={() => { setNum(n); go(2); }}>{lab(n, mod)}</button>)}</div>
            </>)}
            {step === 2 && (<>
              <p className="qk-q">Quando l'hai preso?</p>
              <div className="qk-dates">
                <button className={`qk-d ${dmode === 'oggi' ? 'on' : ''}`} onClick={() => pickDate('oggi', today())}><Sun size={22} />Oggi<small>{short(today())}</small></button>
                <button className={`qk-d ${dmode === 'ieri' ? 'on' : ''}`} onClick={() => pickDate('ieri', ago(1))}><History size={22} />Ieri<small>{short(ago(1))}</small></button>
                <button className={`qk-d ${dmode === 'altra' ? 'on' : ''}`} onClick={() => { setDmode('altra'); if (dmode !== 'altra') setDate(ago(2)); }}><CalendarDays size={22} />Altra data<small>{dmode === 'altra' ? short(date) : 'scegli'}</small></button>
              </div>
              {dmode === 'altra' && <input className="qk-date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value || today())} />}
            </>)}
            {step === 3 && (<>
              <p className="qk-q">Ultimi dettagli</p>
              <div className="qk-types">{TYPES.map(([k, l, I]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => { setT(k); setPref('mv-type', k); }}><I size={15} />{l}</button>)}</div>
              <textarea rows={2} maxLength={200} placeholder="Argomento o note (facoltativo), es. verifica capitolo 3" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="qk-sum"><span>{cur?.name}</span><span>{fv(value)}</span><span>{dlabel}</span><span>{type}</span></div>
            </>)}
            {err && <p className="err">{err}</p>}
            {step > 0 && (
              <div className="qk-foot">
                <button className="btn ghost" onClick={() => go(step - 1)}><ArrowLeft size={16} />Indietro</button>
                {step === 2 && <button className="btn" onClick={() => go(3)}>Avanti</button>}
                {step === 3 && <button className="btn" disabled={busy || value == null || !sid} onClick={save}><Save size={16} />Salva voto</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
