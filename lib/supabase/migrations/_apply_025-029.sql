-- 새 마이그레이션 통합본 (025~029). Supabase 대시보드 SQL Editor에 통째로 붙여넣고 Run 하세요.
-- 전부 'if not exists' 라서 이미 적용된 부분이 있어도 안전하게 재실행됩니다.

-- ======================= 025_news_table.sql =======================
-- Brand / office-chair news collected from Google News RSS, AI-curated.

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  url text not null unique,
  title text,
  source_name text,
  image_url text,
  published_at timestamptz,
  brand text,
  summary text,
  status text not null default 'published' check (status in ('published', 'hidden')),
  featured boolean not null default false,
  source_query text
);

create index if not exists news_brand_idx
  on public.news (brand);
create index if not exists news_status_idx
  on public.news (status);
create index if not exists news_featured_idx
  on public.news (featured);
create index if not exists news_published_at_desc_idx
  on public.news (published_at desc);

alter table public.news enable row level security;

create policy "Public read published news"
  on public.news for select
  using (status = 'published');

grant select on public.news to anon, authenticated;


-- ======================= 026_news_slug.sql =======================
-- Add SEO slug + "why it matters" editorial value-add to news.

alter table public.news
  add column if not exists slug text,
  add column if not exists why_it_matters text;

create unique index if not exists news_slug_key
  on public.news (slug);


-- ======================= 027_audit_columns.sql =======================
-- Re-audit columns: store Claude's re-evaluation of how well an existing item
-- matches its assigned product/brand, so suspect items can be reviewed + deleted.

alter table public.reviews
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

alter table public.videos
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

alter table public.news
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

create index if not exists reviews_audit_score_idx on public.reviews (audit_score);
create index if not exists videos_audit_score_idx on public.videos (audit_score);
create index if not exists news_audit_score_idx on public.news (audit_score);


-- ======================= 028_page_views.sql =======================
-- First-party pageview tracking (no Google Analytics). Inserts come from
-- /api/track/pageview via the service-role client, so RLS stays closed.
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  country text,
  visitor_id text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_path_idx on page_views (path);
create index if not exists page_views_visitor_idx on page_views (visitor_id);

alter table page_views enable row level security;

-- Aggregated traffic stats for the admin dashboard, computed in SQL.
create or replace function get_traffic_stats()
returns json
language sql
stable
as $$
  with pv as (
    select * from page_views where created_at >= now() - interval '30 days'
  )
  select json_build_object(
    'pv_today', (select count(*) from pv where created_at >= date_trunc('day', now())),
    'pv_week',  (select count(*) from pv where created_at >= now() - interval '7 days'),
    'pv_month', (select count(*) from pv),
    'uv_today', (select count(distinct visitor_id) from pv where created_at >= date_trunc('day', now())),
    'uv_week',  (select count(distinct visitor_id) from pv where created_at >= now() - interval '7 days'),
    'uv_month', (select count(distinct visitor_id) from pv),
    'top_pages', (select coalesce(json_agg(t), '[]'::json) from (
      select path, count(*)::int as views from pv
      where created_at >= now() - interval '7 days'
      group by path order by count(*) desc limit 10
    ) t),
    'top_referrers', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(nullif(referrer, ''), '(direct)') as referrer, count(*)::int as views from pv
      where created_at >= now() - interval '7 days'
      group by 1 order by count(*) desc limit 10
    ) t),
    'by_country', (select coalesce(json_agg(t), '[]'::json) from (
      select coalesce(country, 'Other') as country, count(*)::int as views from pv
      where created_at >= now() - interval '7 days'
      group by 1 order by count(*) desc limit 20
    ) t)
  );
$$;

grant execute on function get_traffic_stats() to service_role;


-- ======================= 029_affiliate_clicks_country.sql =======================
-- The app (both /api/affiliate/track and the admin analytics query) expects a
-- `country` column on affiliate_clicks, but the table was missing it — so every
-- click insert failed silently and the Analytics page errored with
-- "column affiliate_clicks.country does not exist". Add it back.
alter table affiliate_clicks add column if not exists country text;


