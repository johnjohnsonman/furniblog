-- Fix: an earlier version of 031 created chairpedia without the landing-page
-- columns. These idempotent ALTERs add anything missing. Safe to run anytime.
-- Run this in the Supabase SQL Editor.

alter table public.chairpedia add column if not exists subtitle text;
alter table public.chairpedia add column if not exists hero_image_url text;
alter table public.chairpedia add column if not exists excerpt text;
alter table public.chairpedia add column if not exists seo_title text;
alter table public.chairpedia add column if not exists seo_description text;
alter table public.chairpedia add column if not exists origin text;
alter table public.chairpedia add column if not exists collections text[] not null default '{}';
alter table public.chairpedia add column if not exists featured boolean not null default false;
alter table public.chairpedia add column if not exists lang text not null default 'en';
alter table public.chairpedia add column if not exists published_at timestamptz;

create index if not exists chairpedia_featured_idx on public.chairpedia (featured);
