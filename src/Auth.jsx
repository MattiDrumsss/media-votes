import { useState } from 'react';
import { useStore } from './store.jsx';

const tr = (m = '') => {
  if (/invalid login/i.test(m)) return 'Email o password non corretti.';
  if (/already registered/i.test(m)) return 'Esiste già un account con questa email.';
  if (/password/i.test(m)) return 'La password deve avere almeno 6 caratteri.';
  if (/valid email|invalid/i.test(m)) return 'Inserisci un indirizzo email valido.';
  if (/rate|too many/i.test(m)) return 'Troppi tentativi. Riprova tra qualche minuto.';
  return 'Operazione non riuscita. Riprova.';
};

export default function Auth() {
  const { signIn, signUp } = useStore();
  const [mode, setMode] = useState('in');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setInfo(''); setBusy(true);
    const { data, error } = await (mode === 'in' ? signIn : signUp)(email.trim(), pw);
    setBusy(false);
    if (error) return setErr(tr(error.message));
    if (mode === 'up' && !data.session) setInfo('Account creato. Controlla la tua email e clicca sul link di conferma, poi accedi.');
  };
  return (
    <div className="authwrap">
      <div className="card auth">
        <img src="/logo.png" className="logo" alt="Media Votes" />
        <div className="seg">
          <button className={mode === 'in' ? 'on' : ''} onClick={() => { setMode('in'); setErr(''); setInfo(''); }}>Accedi</button>
          <button className={mode === 'up' ? 'on' : ''} onClick={() => { setMode('up'); setErr(''); setInfo(''); }}>Crea account</button>
        </div>
        <form className="form" onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Password<input type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          {err && <p className="err">{err}</p>}{info && <p className="muted">{info}</p>}
          <button className="btn" disabled={busy}>{busy ? 'Attendi…' : mode === 'in' ? 'ACCEDI' : 'CREA ACCOUNT'}</button>
        </form>
      </div>
    </div>
  );
}
