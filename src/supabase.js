import { createClient } from '@supabase/supabase-js';
const env = import.meta.env;
const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '');
let url = clean(env.SUPABASE_URL || env.VITE_SUPABASE_URL);
const key = clean(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY);
// Tiene solo l'indirizzo base, anche se per errore e' stato incollato con /rest/v1 o altro in fondo
try { url = new URL(url).origin; } catch { url = ''; }
export const configured = Boolean(url && key);
export const supabase = createClient(url || 'http://localhost', key || 'missing');
