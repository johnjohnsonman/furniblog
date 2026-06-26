-- Best Lists: admin-curated, DB-backed "Best X chairs" rankings.
-- Replaces the old hardcoded static lists. Items reference live catalog
-- products, so names/images/prices/pros/cons stay correct automatically.
-- Run this in the Supabase SQL Editor.

create table if not exists public.best_lists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  intro text,
  hero_image_url text,
  seo_title text,
  seo_description text,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.best_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.best_lists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  rank int not null default 0,
  blurb text,
  created_at timestamptz not null default now(),
  unique (list_id, product_id)
);

create index if not exists best_lists_slug_idx on public.best_lists (slug);
create index if not exists best_lists_status_idx on public.best_lists (status);
create index if not exists best_list_items_list_idx on public.best_list_items (list_id);

-- RLS: public reads published lists + their items; writes via service role only.
alter table public.best_lists enable row level security;
alter table public.best_list_items enable row level security;

drop policy if exists "best_lists public read" on public.best_lists;
create policy "best_lists public read"
  on public.best_lists for select using (status = 'published');

drop policy if exists "best_list_items public read" on public.best_list_items;
create policy "best_list_items public read"
  on public.best_list_items for select using (true);

grant select on public.best_lists to anon, authenticated;
grant select on public.best_list_items to anon, authenticated;

-- Seed the existing six lists (titles only; curate items in the admin).
insert into public.best_lists (slug, title, sort_order) values
  ('best-office-chairs', 'Best Office Chairs', 1),
  ('best-for-back-pain', 'Best for Back Pain', 2),
  ('best-for-tall-people', 'Best for Tall People', 3),
  ('best-under-1000', 'Best Under $1,000', 4),
  ('best-japanese-chairs', 'Best Japanese Chairs', 5),
  ('best-for-long-hours', 'Best for Long Hours', 6)
on conflict (slug) do nothing;

-- Best-effort backfill: add any catalog product whose slug matches the old
-- static curation. Non-matching slugs are simply skipped — curate the rest
-- in the admin.
insert into public.best_list_items (list_id, product_id, rank)
select l.id, p.id, x.rank
from (values
  ('best-office-chairs','herman-miller-aeron',1),
  ('best-office-chairs','herman-miller-embody',2),
  ('best-office-chairs','steelcase-leap-v2',3),
  ('best-office-chairs','steelcase-gesture',4),
  ('best-office-chairs','humanscale-freedom',5),
  ('best-office-chairs','kokuyo-ing',6),
  ('best-office-chairs','kokuyo-ing-cloud',7),
  ('best-office-chairs','okamura-sylphy',8),
  ('best-for-back-pain','herman-miller-aeron',1),
  ('best-for-back-pain','herman-miller-embody',2),
  ('best-for-back-pain','steelcase-gesture',3),
  ('best-for-back-pain','kokuyo-ing-cloud',4),
  ('best-for-tall-people','herman-miller-aeron',1),
  ('best-for-tall-people','steelcase-gesture',2),
  ('best-for-tall-people','okamura-contessa-ii',3),
  ('best-under-1000','herman-miller-sayl',1),
  ('best-under-1000','steelcase-leap-v2',2),
  ('best-under-1000','itoki-act2',3),
  ('best-under-1000','knoll-generation',4),
  ('best-japanese-chairs','okamura-contessa-ii',1),
  ('best-japanese-chairs','okamura-sylphy',2),
  ('best-japanese-chairs','itoki-act2',3),
  ('best-japanese-chairs','kokuyo-ing',4),
  ('best-japanese-chairs','kokuyo-ing-cloud',5),
  ('best-for-long-hours','herman-miller-aeron',1),
  ('best-for-long-hours','herman-miller-embody',2),
  ('best-for-long-hours','steelcase-gesture',3),
  ('best-for-long-hours','humanscale-freedom',4),
  ('best-for-long-hours','kokuyo-ing-cloud',5),
  ('best-for-long-hours','okamura-sylphy',6)
) as x(list_slug, product_slug, rank)
join public.best_lists l on l.slug = x.list_slug
join public.products p on p.slug = x.product_slug
on conflict (list_id, product_id) do nothing;
