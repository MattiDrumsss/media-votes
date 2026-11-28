import { useEffect, useState } from 'react';
import { Bell, BellOff, Send } from 'lucide-react';
import { supabase } from './supabase';
import { useStore } from './store.jsx';
import { VAPID, pushSupported, getSub, enablePush, disablePush, sendTest } from './push';

const DEF = { notify_before: true, notify_same: true, notify_after: true, notify_time: '07:00' };

export default function PushCard() {
  const { session } = useStore();
  const [on, setOn] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [p, setP] = useState(DEF);
  const ok = pushSupported() && VAPID;
  const loadPrefs = async () => {
    const s = await getSub(); if (!s) return;
    const { data } = await supabase.from('push_subs').select('notify_before,notify_same,notify_after,notify_time').eq('endpoint', s.endpoint).maybeSingle();
    if (data) setP(data);
  };
  useEffect(() => {
    if (!ok) return;
    getSub().then((s) => { const v = !!s && Notification.permission === 'granted'; setOn(v); if (v) loadPrefs(); }).catch(() => {});
  }, [ok]);
  const run = (fn) => async () => { setBusy(true); setMsg(''); try { await fn(); } catch (e) { setMsg(e.message || 'Operazione non riuscita.'); } setBusy(false); };
  const toggle = run(async () => { if (on) { await disablePush(); setOn(false); } else { await enablePush(); setOn(true); await loadPrefs(); } });
  const test = run(async () => setMsg(await sendTest(session.access_token)));
  const save = async (n) => {
    setP(n);
    if (!n.notify_before && !n.notify_same && !n.notify_after) return setMsg('Scegli almeno un momento per la notifica.');
    if (!/^\d\d:\d\d$/.test(n.notify_time)) return;
    const s = await getSub();
    const { error } = await supabase.from('push_subs').update(n).eq('endpoint', s.endpoint);
    setMsg(error ? error.message : 'Preferenze salvate.');
  };
  return (
    <div className="card"><h3>Notifiche verifiche</h3>
      <p className="muted">Ti avvisiamo delle verifiche in calendario, quando e all'ora che scegli tu.</p>
      {!pushSupported() ? <p className="muted small">Su iPhone le notifiche funzionano solo dopo aver aggiunto l'app alla schermata Home (iOS 16.4 o successivo): apri l'app dalla Home e torna qui.</p>
        : !VAPID ? <p className="err">Chiave notifiche mancante: aggiungi VAPID_PUBLIC_KEY su Vercel.</p>
        : <>
          <div className="row wrap">
            <button className="btn" onClick={toggle} disabled={busy}>{on ? <><BellOff size={18} />Disattiva</> : <><Bell size={18} />Attiva notifiche</>}</button>
            {on && <button className="btn ghost" onClick={test} disabled={busy}><Send size={18} />Prova</button>}
          </div>
          {on && (
            <div className="prefs">
              <span className="label">Quando avvisarmi</span>
              <label className="chk"><input type="checkbox" checked={p.notify_before} onChange={(e) => save({ ...p, notify_before: e.target.checked })} />Il giorno prima</label>
              <label className="chk"><input type="checkbox" checked={p.notify_same} onChange={(e) => save({ ...p, notify_same: e.target.checked })} />Il giorno stesso</label>
              <label className="chk"><input type="checkbox" checked={p.notify_after} onChange={(e) => save({ ...p, notify_after: e.target.checked })} />Il giorno dopo, per registrare il voto</label>
              <label className="timef">A che ora<input type="time" value={p.notify_time} onChange={(e) => save({ ...p, notify_time: e.target.value })} /></label>
            </div>
          )}
        </>}
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
