-- YouTube videos linked to chair products

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  youtube_id text not null unique,
  title text,
  channel_title text,
  thumbnail_url text,
  published_at timestamptz,
  duration text,
  view_count bigint,
  description text,
  chair_id uuid references public.products (id) on delete set null,
  brand text,
  status text not null default 'published' check (status in ('published', 'hidden')),
  source_query text
);

create index if not exists videos_chair_id_idx
  on public.videos (chair_id);
create index if not exists videos_brand_idx
  on public.videos (brand);
create index if not exists videos_status_idx
  on public.videos (status);
create index if not exists videos_published_at_desc_idx
  on public.videos (published_at desc);

alter table public.videos enable row level security;

create policy "Public read published videos"
  on public.videos for select
  using (status = 'published');

grant select on public.videos to anon, authenticated;
