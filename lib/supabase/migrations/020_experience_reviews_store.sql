-- Chairpark in-store experience reviews (store form + 614 import)
-- Run in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.experience_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'published')),
  source text not null default 'store_form' check (source in ('store_form', 'import_614')),

  -- 체험자
  gender text,
  height text,
  weight_or_body text,
  age_group text,
  job text,

  -- 사용 패턴
  main_purpose text,
  sitting_hours text,
  previous_chair text,
  pain_areas text[] not null default '{}',
  standing_desk text,

  -- 순위 (의자 이름)
  rank1_chair text,
  rank2_chair text,
  rank3_chair text,

  -- 평가
  rating int check (rating between 1 and 5),
  review_text text,
  selection_reasons text[] not null default '{}',
  purchase_reason text,

  -- 추가 (선택)
  photo_url text,
  store_location text,
  comparing_chairs text,
  nickname text,
  phone text
);

create index if not exists experience_reviews_status_idx
  on public.experience_reviews (status);
create index if not exists experience_reviews_created_at_idx
  on public.experience_reviews (created_at desc);
create index if not exists experience_reviews_source_idx
  on public.experience_reviews (source);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.experience_reviews enable row level security;

-- Public can read only published rows.
drop policy if exists "Public read published experience_reviews" on public.experience_reviews;
create policy "Public read published experience_reviews"
  on public.experience_reviews for select
  using (status = 'published');

-- Anonymous visitors may submit, but only as pending store_form rows.
drop policy if exists "Anon insert pending experience_reviews" on public.experience_reviews;
create policy "Anon insert pending experience_reviews"
  on public.experience_reviews for insert
  to anon, authenticated
  with check (status = 'pending' and source = 'store_form');

-- service_role bypasses RLS entirely (used by the submit + admin APIs).

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant select, insert on public.experience_reviews to anon;
grant select, insert on public.experience_reviews to authenticated;
grant all on public.experience_reviews to service_role;
