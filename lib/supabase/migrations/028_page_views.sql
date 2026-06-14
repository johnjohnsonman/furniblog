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
