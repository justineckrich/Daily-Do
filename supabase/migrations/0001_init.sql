-- Daily-Do schema. Run once in the Supabase SQL Editor.
-- Every table is private to the signed-in user via row level security.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text not null default '📁',
  position integer not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  next_step text,
  created_at timestamptz not null default now()
);

create table public.days (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  one_thing text not null default '',
  one_thing_done boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.priorities (
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

create table public.meetings (
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

create table public.captures (
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

create table public.ideas (
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

create index on public.priorities (user_id, project_id) where not done;
create index on public.ideas (user_id, status);

do $$
declare t text;
begin
  foreach t in array array['projects', 'days', 'priorities', 'meetings', 'captures', 'ideas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;
