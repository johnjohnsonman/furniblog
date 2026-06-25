-- Blog: AI-converted editorial posts. Paste a source URL (Korean or English)
-- in the admin → AI rewrites it into a clean, SEO-optimized English post with
-- Amazon affiliate links. Content stored as HTML (same editor as Chairpedia).
-- Run this in the Supabase SQL Editor.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  hero_image_url text,
  excerpt text,
  content_html text not null default '',
  seo_title text,
  seo_description text,
  source_url text,                              -- original article the post was converted from
  featured boolean not null default false,      -- highlight on the blog index
  status text not null default 'draft' check (status in ('draft', 'published')),
  lang text not null default 'en',
  -- async AI conversion state (fire-and-poll, like Chairpedia)
  gen_status text,                              -- 'generating' | 'done' | 'error' | null
  gen_error text,
  gen_started_at timestamptz,
  gen_sources text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_featured_idx on public.blog_posts (featured);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);

-- RLS: anyone may read PUBLISHED posts (public site uses the anon key);
-- writes happen only via the service-role key (admin), which bypasses RLS.
alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts public read published" on public.blog_posts;
create policy "blog_posts public read published"
  on public.blog_posts for select
  using (status = 'published');

-- SQL-created tables have no anon SELECT grant by default → the public (anon)
-- key gets "permission denied" and published posts won't show. Grant it.
grant select on public.blog_posts to anon;
grant select on public.blog_posts to authenticated;
