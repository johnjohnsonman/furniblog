-- Pipeline run history for admin dashboard
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  chair_slug text not null,
  chair_name text not null,
  sources text[] not null default '{}',
  collected integer not null default 0,
  processed integer not null default 0,
  saved integer not null default 0,
  failed integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_runs_created_at_idx
  on public.pipeline_runs (created_at desc);

alter table public.pipeline_runs enable row level security;
