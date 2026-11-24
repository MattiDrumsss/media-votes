-- MEDIA VOTES v2: incolla in Supabase > SQL Editor > New query e premi Run
alter table public.subjects add column if not exists color text not null default '#a855f7';
alter table public.subjects add column if not exists icon text not null default 'book';

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  date date not null,
  kind text not null default 'verifica' check (kind in ('verifica','interrogazione')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists events_user_idx on public.events (user_id);
alter table public.events enable row level security;
create policy "events own" on public.events for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.events to authenticated;
