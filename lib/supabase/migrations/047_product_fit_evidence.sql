-- PREPARED ONLY. Apply after review in the furniblog Supabase project.
-- Field-level provenance for Chairpedia fit measurements.
begin;

create table if not exists public.product_fit_evidence (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  field_key text not null check (field_key in (
    'recommended_height',
    'seat_height',
    'seat_depth',
    'seat_width',
    'weight_capacity',
    'armrest_floor_height'
  )),
  evidence_type text not null default 'manufacturer' check (evidence_type in (
    'manufacturer',
    'authorized_retailer',
    'editorial',
    'manual'
  )),
  source_title text not null default '',
  source_url text not null check (source_url ~ '^https?://'),
  checked_on date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, field_key, source_url)
);

create index if not exists product_fit_evidence_product_idx
  on public.product_fit_evidence(product_id, field_key, checked_on desc);

alter table public.product_fit_evidence enable row level security;

create policy product_fit_evidence_public_read
  on public.product_fit_evidence
  for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and p.published = true
  ));

revoke all on public.product_fit_evidence from anon, authenticated;
grant select on public.product_fit_evidence to anon, authenticated;
grant all on public.product_fit_evidence to service_role;

commit;
