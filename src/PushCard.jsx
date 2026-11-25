import { useEffect, useState } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import { useStore } from './store.jsx';
import { VAPID, pushSupported, getSub, enablePush, disablePush, sendTest } from './push';

export default function PushCard() {
  const { session } = useStore();
  const [on, setOn] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const ok = pushSupported() && VAPID;
  useEffect(() => { if (ok) getSub().then((s) => setOn(!!s && Notification.permission === 'granted')).catch(() => {}); }, [ok]);
  const run = (fn) => async () => { setBusy(true); setMsg(''); try { await fn(); } catch (e) { setMsg(e.message || 'Operazione non riuscita.'); } setBusy(false); };
  const toggle = run(async () => { if (on) { await disablePush(); setOn(false); } else { await enablePush(); setOn(true); } });
  const test = run(async () => setMsg(await sendTest(session.access_token)));
  return (
    <div className="card"><h3>Notifiche verifiche</h3>
      <p className="muted">Ogni mattina ti avvisiamo delle verifiche di oggi e di domani.</p>
      {!pushSupported() ? <p className="muted small">Su iPhone le notifiche funzionano solo dopo aver aggiunto l'app alla schermata Home (iOS 16.4 o successivo): apri l'app dalla Home e torna qui.</p>
        : !VAPID ? <p className="err">Chiave notifiche mancante: aggiungi VAPID_PUBLIC_KEY su Vercel.</p>
        : <div className="row wrap">
            <button className="btn" onClick={toggle} disabled={busy}>{on ? <><BellOff size={18} />Disattiva</> : <><Bell size={18} />Attiva notifiche</>}</button>
            {on && <button className="btn ghost" onClick={test} disabled={busy}><Send size={18} />Prova</button>}
          </div>}
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
