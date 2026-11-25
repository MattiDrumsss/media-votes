import { supabase, supabaseUrl } from './supabase';
const b64 = (s) => { const r = atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, (c) => c.charCodeAt(0)); };
export const VAPID = (import.meta.env.VAPID_PUBLIC_KEY || import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim();
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export async function getSub() { const reg = await navigator.serviceWorker.ready; return reg.pushManager.getSubscription(); }
export async function enablePush() {
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Permesso notifiche negato. Abilitalo dalle impostazioni del telefono.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) }));
  const j = sub.toJSON();
  const { error } = await supabase.from('push_subs').upsert({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' });
  if (error) throw new Error(error.message);
}
export async function disablePush() {
  const sub = await getSub(); if (!sub) return;
  await supabase.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe();
}
export async function sendTest() {
  const { data, error } = await supabase.functions.invoke('send-reminders', { body: { test: true } });
  if (error) {
    let m = error.message || 'Invio non riuscito';
    try { const j = await error.context.json(); m = j.error || j.message || m; } catch { /* nessun dettaglio */ }
    throw new Error(m + ' [' + supabaseUrl + ']');
  }
  return data?.sent ? 'Notifica inviata: arriva tra pochi secondi.' : 'Nessun dispositivo registrato: attiva prima le notifiche.';
}
