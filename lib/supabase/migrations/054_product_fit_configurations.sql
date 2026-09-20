-- PREPARED ONLY. Configuration storage; does not change active product specs.
begin;
create table if not exists public.product_fit_configurations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  configuration_key text not null check (configuration_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  market_code text not null check (market_code ~ '^[A-Z]{2}$'),
  label text not null check (length(trim(label)) > 0),
  status text not null default 'draft' check (status in ('draft','verified','retired')),
  options jsonb not null default '{}'::jsonb check (jsonb_typeof(options) = 'object'),
  seat_height_min numeric(7,2), seat_height_max numeric(7,2),
  seat_depth_min numeric(7,2), seat_depth_max numeric(7,2), seat_depth_fixed numeric(7,2),
  seat_width numeric(7,2), weight_capacity numeric(7,2),
  armrest_floor_height_min numeric(7,2), armrest_floor_height_max numeric(7,2),
  source_title text not null check (length(trim(source_title)) > 0),
  source_url text not null check (source_url ~ '^https?://[^/[:space:]]+'),
  checked_on date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, market_code, configuration_key),
  check ((seat_height_min is null) = (seat_height_max is null)),
  check (seat_height_min > 0 and seat_height_max >= seat_height_min and seat_height_max < 1000),
  check ((seat_depth_min is null) = (seat_depth_max is null)),
  check (seat_depth_min > 0 and seat_depth_max >= seat_depth_min and seat_depth_max < 1000),
  check (seat_depth_fixed is null or (seat_depth_min is null and seat_depth_fixed > 0 and seat_depth_fixed < 1000)),
  check (seat_width > 0 and seat_width < 1000),
  check (weight_capacity > 0 and weight_capacity < 1000),
  check ((armrest_floor_height_min is null) = (armrest_floor_height_max is null)),
  check (armrest_floor_height_min > 0 and armrest_floor_height_max >= armrest_floor_height_min and armrest_floor_height_max < 1000),
  check (num_nonnulls(seat_height_min, seat_depth_min, seat_depth_fixed, seat_width, weight_capacity, armrest_floor_height_min) > 0)
);
create index if not exists product_fit_configurations_lookup
  on public.product_fit_configurations(product_id, market_code, status);
alter table public.product_fit_configurations enable row level security;
drop policy if exists product_fit_configurations_public_read on public.product_fit_configurations;
create policy product_fit_configurations_public_read on public.product_fit_configurations
for select to anon, authenticated using (
  status = 'verified' and exists(select 1 from public.products p where p.id = product_id and p.published = true)
);
revoke all on public.product_fit_configurations from anon, authenticated;
grant select on public.product_fit_configurations to anon, authenticated;
grant all on public.product_fit_configurations to service_role;
comment on table public.product_fit_configurations is 'Independent regional/option measurements. Never merge ranges across configurations. Storage alone does not activate recommendation use.';
commit;
