-- Experience review session + rankings
-- One session can rank up to 3 chairs.

create table if not exists public.review_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text not null default 'native' check (source in ('native', 'google_form')),
  sex text check (sex in ('male', 'female')),
  height_band text check (height_band in ('~160', '160s', '170s', '180s', '185+')),
  body text check (body in ('below', 'normal', 'above')),
  age_band text check (age_band in ('10s', '20s', '30s', '40s', '50s+')),
  job text,
  sit_hours text check (sit_hours in ('under2', '2to6', 'over6')),
  uses text[] not null default '{}',
  pain text[] not null default '{}',
  reasons text[] not null default '{}',
  comment text,
  purchased boolean,
  contact text
);

comment on column public.review_sessions.contact is
  'Private raffle contact; never expose to client payloads';

create table if not exists public.review_rankings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.review_sessions (id) on delete cascade,
  chair_id uuid not null references public.products (id) on delete restrict,
  rank smallint not null check (rank between 1 and 3),
  unique (session_id, rank),
  unique (session_id, chair_id)
);

create index if not exists review_sessions_status_idx
  on public.review_sessions (status);
create index if not exists review_sessions_pain_gin_idx
  on public.review_sessions using gin (pain);
create index if not exists review_sessions_uses_gin_idx
  on public.review_sessions using gin (uses);
create index if not exists review_rankings_chair_rank_idx
  on public.review_rankings (chair_id, rank);
create index if not exists review_rankings_session_idx
  on public.review_rankings (session_id);

alter table public.review_sessions enable row level security;
alter table public.review_rankings enable row level security;

create policy "Public read approved review_sessions"
  on public.review_sessions for select
  using (status = 'approved');

create policy "Public read review_rankings for approved sessions"
  on public.review_rankings for select
  using (
    exists (
      select 1
      from public.review_sessions s
      where s.id = review_rankings.session_id
        and s.status = 'approved'
    )
  );

grant select on public.review_sessions to anon, authenticated;
grant select on public.review_rankings to anon, authenticated;
