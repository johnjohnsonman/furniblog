-- "A vs B" comparison pages. Content (comparison table + verdict) is AI-drafted
-- from real product specs + aggregated reviews, then human-reviewed before
-- publishing. Two products referenced by FK; the narrative lives in content_html
-- (edited in the same TipTap editor as Chairpedia/Blog).
create table if not exists comparisons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default 'Untitled comparison',
  subtitle text,
  excerpt text,
  seo_title text,
  seo_description text,
  hero_image_url text,
  content_html text not null default '',
  product_a_id uuid references products(id) on delete set null,
  product_b_id uuid references products(id) on delete set null,
  tier text default 'mixed',            -- premium | value | mixed (filter/badge)
  collections text[] default '{}',
  featured boolean default false,
  status text not null default 'draft', -- draft | published
  gen_status text,                      -- generating | done | error
  gen_error text,
  gen_started_at timestamptz,
  gen_cost_usd numeric,
  gen_input_tokens integer,
  gen_output_tokens integer,
  gen_tier text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists comparisons_status_idx on comparisons (status);
create index if not exists comparisons_slug_idx on comparisons (slug);
create index if not exists comparisons_product_a_idx on comparisons (product_a_id);
create index if not exists comparisons_product_b_idx on comparisons (product_b_id);

-- Public reads published only (admin uses the service key and bypasses RLS).
alter table comparisons enable row level security;
drop policy if exists "comparisons public read" on comparisons;
create policy "comparisons public read" on comparisons
  for select using (status = 'published');

-- SQL-created tables have no anon SELECT by default → grant it (like 034).
grant select on comparisons to anon;
