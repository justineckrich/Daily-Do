-- Daily-Do schema. Safe to run more than once in the Supabase SQL Editor.
-- Every table is private to the signed-in user via row level security.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text not null default '📁',
  position integer not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  next_step text,
  created_at timestamptz not null default now()
);

create table if not exists public.days (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  one_thing text not null default '',
  one_thing_done boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  position smallint not null check (position between 1 and 3),
  text text not null default '',
  done boolean not null default false,
  project_id uuid references public.projects on delete set null,
  rolled_from date,
  updated_at timestamptz not null default now(),
  unique (user_id, date, position)
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  google_event_id text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  title text not null,
  location_or_link text,
  project_id uuid references public.projects on delete set null,
  unique (user_id, google_event_id, date)
);

create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  source text not null check (source in ('claude', 'chatgpt', 'manual')),
  external_id text,
  title text,
  raw_text text not null,
  conversation_at timestamptz,
  ingested_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (user_id, source, external_id)
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  capture_id uuid references public.captures on delete set null,
  title text not null,
  summary text,
  next_step text,
  status text not null default 'new' check (status in ('new', 'kept', 'promoted', 'dismissed')),
  promoted_to_date date,
  project_id uuid references public.projects on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists priorities_open_idx on public.priorities (user_id, project_id) where not done;
create index if not exists ideas_status_idx on public.ideas (user_id, status);

alter table public.projects enable row level security;
alter table public.days enable row level security;
alter table public.priorities enable row level security;
alter table public.meetings enable row level security;
alter table public.captures enable row level security;
alter table public.ideas enable row level security;

drop policy if exists "own rows" on public.projects;
drop policy if exists "own rows" on public.days;
drop policy if exists "own rows" on public.priorities;
drop policy if exists "own rows" on public.meetings;
drop policy if exists "own rows" on public.captures;
drop policy if exists "own rows" on public.ideas;

create policy "own rows" on public.projects for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.days for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.priorities for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.meetings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.captures for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on public.ideas for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
