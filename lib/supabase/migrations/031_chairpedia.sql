-- Chairpedia: per-chair deep editorial entries (AI-drafted, human-edited).
-- Content is stored as HTML authored in the admin rich editor.
-- Run this in the Supabase SQL Editor.

create table if not exists public.chairpedia (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  hero_image_url text,
  excerpt text,
  content_html text not null default '',
  -- optional link to a catalog product (enables buy button / cross-links)
  product_id uuid references public.products (id) on delete set null,
  seo_title text,
  seo_description text,
  -- landing-page fields
  origin text,                                 -- e.g. 'Japan','Germany','USA' (Origin filter)
  collections text[] not null default '{}',    -- editor-curated collection slugs (rails)
  featured boolean not null default false,     -- include in the featured rotation
  status text not null default 'draft' check (status in ('draft', 'published')),
  lang text not null default 'en',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chairpedia_slug_idx on public.chairpedia (slug);
create index if not exists chairpedia_status_idx on public.chairpedia (status);
create index if not exists chairpedia_product_id_idx on public.chairpedia (product_id);
create index if not exists chairpedia_featured_idx on public.chairpedia (featured);

-- If you already ran an earlier version of this file, run these instead:
--   alter table public.chairpedia add column if not exists origin text;
--   alter table public.chairpedia add column if not exists collections text[] not null default '{}';
--   alter table public.chairpedia add column if not exists featured boolean not null default false;

-- RLS: anyone may read PUBLISHED entries (public site uses the anon key);
-- writes happen only via the service-role key (admin), which bypasses RLS.
alter table public.chairpedia enable row level security;

drop policy if exists "chairpedia public read published" on public.chairpedia;
create policy "chairpedia public read published"
  on public.chairpedia for select
  using (status = 'published');
