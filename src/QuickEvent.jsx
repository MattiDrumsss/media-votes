import { useEffect, useState } from 'react';
import { X, Check, FileText, Mic, Sun, Sunrise, CalendarClock, CalendarDays, ArrowLeft, CalendarPlus } from 'lucide-react';
import { SubjIcon } from './icons.jsx';
import { useStore } from './store.jsx';
import { today, daysUntil, dayLabel } from './utils';
import { sfx } from './feedback';

const STEPS = ['Materia', 'Prova', 'Data', 'Dettagli'];
const plus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
const short = (d) => new Date(d + 'T00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const KIND = { verifica: 'Verifica', interrogazione: 'Interrogazione' };

export default function QuickEvent({ onClose }) {
  const { subjects, addEvent } = useStore();
  const [step, setStep] = useState(0); const [sid, setSid] = useState(''); const [kind, setKind] = useState('verifica');
  const [date, setDate] = useState(plus(1)); const [dmode, setDmode] = useState('domani'); const [note, setNote] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(null);
  useEffect(() => { document.body.classList.add('lock'); return () => document.body.classList.remove('lock'); }, []);
  const cur = subjects.find((s) => s.id === sid);
  const dlabel = { oggi: 'Oggi', domani: 'Domani', sett: 'Tra una settimana', altra: short(date) }[dmode];
  const go = (s) => { setStep(s); setErr(''); };
  const pickDate = (mode, d) => { setDmode(mode); setDate(d); go(3); };
  const save = async () => {
    setBusy(true);
    const r = await addEvent({ subjectId: sid, date, kind, note: note.trim() }); setBusy(false);
    if (r) { sfx('err'); return setErr(r); }
    sfx('ok'); setDone({ label: dayLabel(daysUntil(date)), text: `${KIND[kind]} di ${cur?.name}`, color: cur?.color }); setTimeout(onClose, 1600);
  };
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qk" style={{ '--c': (done?.color || cur?.color) || 'var(--p)' }}>
        <button className="icon-btn qk-x" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
        <h3 className="qk-title">Nuova verifica</h3>
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
            <div className="qk-bigv txt">{done.label}</div>
            <p className="muted">{done.text}</p>
          </div>
        ) : (
          <div key={step} className="qk-slide">
            {step === 0 && (<>
              <p className="qk-q">Di che materia?</p>
              {subjects.length ? <div className="qk-subjects">{subjects.map((s, i) => <button key={s.id} className={`qk-tile ${sid === s.id ? 'sel' : ''}`} style={{ '--c': s.color, '--i': i }} onClick={() => { setSid(s.id); go(1); }}><SubjIcon s={s} size={24} /><span>{s.name}</span></button>)}</div> : <p className="muted">Crea prima una materia in Impostazioni.</p>}
            </>)}
            {step === 1 && (<>
              <button className="qk-picked" onClick={() => go(0)}><SubjIcon s={cur || { icon: 'book' }} size={22} /><span>{cur?.name}</span><em>Cambia</em></button>
              <p className="qk-q">Che tipo di prova?</p>
              <div className="qk-dates two">
                <button className={`qk-d ${kind === 'verifica' ? 'on' : ''}`} onClick={() => { setKind('verifica'); go(2); }}><FileText size={26} />Verifica<small>scritta o pratica</small></button>
                <button className={`qk-d ${kind === 'interrogazione' ? 'on' : ''}`} onClick={() => { setKind('interrogazione'); go(2); }}><Mic size={26} />Interrogazione<small>orale</small></button>
              </div>
            </>)}
            {step === 2 && (<>
              <p className="qk-q">Quando sarà?</p>
              <div className="qk-dates two">
                <button className={`qk-d ${dmode === 'oggi' ? 'on' : ''}`} onClick={() => pickDate('oggi', today())}><Sun size={22} />Oggi<small>{short(today())}</small></button>
                <button className={`qk-d ${dmode === 'domani' ? 'on' : ''}`} onClick={() => pickDate('domani', plus(1))}><Sunrise size={22} />Domani<small>{short(plus(1))}</small></button>
                <button className={`qk-d ${dmode === 'sett' ? 'on' : ''}`} onClick={() => pickDate('sett', plus(7))}><CalendarClock size={22} />Tra una settimana<small>{short(plus(7))}</small></button>
                <button className={`qk-d ${dmode === 'altra' ? 'on' : ''}`} onClick={() => { setDmode('altra'); if (dmode !== 'altra') setDate(plus(2)); }}><CalendarDays size={22} />Altra data<small>{dmode === 'altra' ? short(date) : 'scegli'}</small></button>
              </div>
              {dmode === 'altra' && <input className="qk-date" type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value || plus(1))} />}
            </>)}
            {step === 3 && (<>
              <p className="qk-q">Su cosa sarà?</p>
              <textarea rows={2} maxLength={200} placeholder="Argomento o note (facoltativo), es. capitolo 4" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="qk-sum"><span>{cur?.name}</span><span>{KIND[kind]}</span><span>{dlabel}</span></div>
            </>)}
            {err && <p className="err">{err}</p>}
            {step > 0 && (
              <div className="qk-foot">
                <button className="btn ghost" onClick={() => go(step - 1)}><ArrowLeft size={16} />Indietro</button>
                {step === 2 && <button className="btn" onClick={() => go(3)}>Avanti</button>}
                {step === 3 && <button className="btn" disabled={busy || !sid} onClick={save}><CalendarPlus size={16} />Aggiungi</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
