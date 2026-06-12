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
