-- MEDIA VOTES: incolla tutto in Supabase > SQL Editor e premi Run

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);
create unique index subjects_user_name_idx on public.subjects (user_id, lower(name));

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  value numeric(4,2) not null check (value >= 1 and value <= 10),
  date date not null default current_date,
  type text not null default 'scritto' check (type in ('scritto','orale','pratico')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index grades_user_idx on public.grades (user_id);

-- Ogni utente vede e modifica SOLO i propri dati
alter table public.subjects enable row level security;
alter table public.grades enable row level security;
create policy "subjects own" on public.subjects for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "grades own" on public.grades for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Permessi per gli utenti che hanno fatto l'accesso (necessari sui progetti Supabase piu' recenti)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.subjects to authenticated;
grant select, insert, update, delete on public.grades to authenticated;
