import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function push(subs: any[], payload: object) {
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload));
      sent++;
    } catch (e: any) {
      if (e.statusCode === 404 || e.statusCode === 410) await db.from('push_subs').delete().eq('id', s.id);
    }
  }
  return sent;
}
const ymd = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  let body: any = {};
  try { body = await req.json(); } catch { /* vuoto */ }

  // Notifica di prova richiesta dall'utente dall'app
  if (body.test) {
    const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return json({ error: 'Non autorizzato' }, 401);
    const { data: subs } = await db.from('push_subs').select('*').eq('user_id', data.user.id);
    return json({ sent: await push(subs || [], { title: 'MEDIA VOTES', body: 'Le notifiche funzionano!', tag: 'test' }) });
  }

  // Promemoria giornaliero chiamato dal cron
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return json({ error: 'Non autorizzato' }, 401);
  const now = new Date();
  const today = ymd(now), tomorrow = ymd(new Date(now.getTime() + 864e5));
  const { data: ev } = await db.from('events').select('user_id,date,kind,subjects(name)').in('date', [today, tomorrow]);
  const by: Record<string, string[]> = {};
  for (const e of (ev || []) as any[]) (by[e.user_id] ||= []).push(`${e.date === today ? 'Oggi' : 'Domani'}: ${e.kind} di ${e.subjects?.name ?? 'una materia'}`);
  let total = 0;
  for (const [uid, lines] of Object.entries(by)) {
    const { data: subs } = await db.from('push_subs').select('*').eq('user_id', uid);
    total += await push(subs || [], { title: 'Verifiche in arrivo', body: lines.join('\n'), tag: 'reminder' });
  }
  return json({ users: Object.keys(by).length, sent: total });
});
