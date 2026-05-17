-- Furniblog Supabase schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type product_track as enum ('chair', 'furniture');
create type brand_tier as enum ('ultra_premium', 'premium', 'mid_range');
create type content_queue_status as enum ('pending', 'processing', 'processed', 'failed');

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country text not null,
  logo_url text,
  description_ko text not null default '',
  website_url text,
  tier brand_tier not null default 'premium',
  founded_year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brands_slug_idx on public.brands (slug);

-- ---------------------------------------------------------------------------
-- designers
-- ---------------------------------------------------------------------------
create table if not exists public.designers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  nationality text not null,
  birth_year integer not null,
  death_year integer,
  bio_ko text not null default '',
  portrait_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists designers_slug_idx on public.designers (slug);

-- ---------------------------------------------------------------------------
-- products (based on types/product.ts + lib/data/products.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid not null references public.brands (id) on delete restrict,
  category text not null,
  track product_track not null default 'chair',
  chair_type text,
  country text,
  designer_id uuid references public.designers (id) on delete set null,
  launch_year integer,
  price_krw integer,
  price_usd integer,
  price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
  thumbnail_url text,
  images text[] not null default '{}',
  description_ko text not null default '',
  description_en text,
  best_for text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  rating_overall numeric(2, 1),
  rating_comfort smallint,
  rating_ergonomics smallint,
  rating_build_quality smallint,
  rating_design smallint,
  rating_value smallint,
  review_count integer not null default 0,
  available_in_korea boolean not null default false,
  try_at_chairpark boolean not null default false,
  chair_specs jsonb,
  furniture_info jsonb,
  seo_title text,
  seo_description text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_brand_id_idx on public.products (brand_id);
create index if not exists products_track_idx on public.products (track);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_published_idx on public.products (published);

-- ---------------------------------------------------------------------------
-- reviews (types/review.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  source text not null,
  summary_ko text not null,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  scores jsonb not null,
  reviewer_height_cm integer,
  reviewer_weight_kg integer,
  usage_hours_per_day numeric(3, 1),
  usage_purpose text check (
    usage_purpose is null
    or usage_purpose in ('office', 'home', 'gaming', 'study')
  ),
  source_url text,
  original_language text not null default 'ko',
  verified boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);
create index if not exists reviews_source_idx on public.reviews (source);

-- ---------------------------------------------------------------------------
-- affiliate_links
-- ---------------------------------------------------------------------------
create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  retailer_name text not null,
  channel text,
  url text not null,
  price_krw integer,
  price_usd integer,
  is_official boolean not null default false,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_links_product_id_idx on public.affiliate_links (product_id);
create index if not exists affiliate_links_active_idx on public.affiliate_links (is_active);

-- ---------------------------------------------------------------------------
-- content_queue (AI pipeline — types/pipeline.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.content_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_url text not null,
  raw_content text not null,
  item_type text not null check (item_type in ('chair', 'furniture')),
  item_id uuid references public.products (id) on delete set null,
  status content_queue_status not null default 'pending',
  ai_output jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists content_queue_status_idx on public.content_queue (status);
create index if not exists content_queue_created_at_idx on public.content_queue (created_at desc);

-- ---------------------------------------------------------------------------
-- affiliate_clicks (analytics)
-- ---------------------------------------------------------------------------
create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  retailer_name text not null,
  clicked_at timestamptz not null default now(),
  referrer text
);

create index if not exists affiliate_clicks_product_id_idx on public.affiliate_clicks (product_id);
create index if not exists affiliate_clicks_clicked_at_idx on public.affiliate_clicks (clicked_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger designers_set_updated_at
  before update on public.designers
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger affiliate_links_set_updated_at
  before update on public.affiliate_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (public read for published content)
-- ---------------------------------------------------------------------------
alter table public.brands enable row level security;
alter table public.designers enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.affiliate_links enable row level security;

create policy "Public read brands"
  on public.brands for select
  using (true);

create policy "Public read designers"
  on public.designers for select
  using (true);

create policy "Public read published products"
  on public.products for select
  using (published = true);

create policy "Public read reviews"
  on public.reviews for select
  using (true);

create policy "Public read active affiliate links"
  on public.affiliate_links for select
  using (is_active = true);

-- content_queue & affiliate_clicks: no public policies (service role only)
