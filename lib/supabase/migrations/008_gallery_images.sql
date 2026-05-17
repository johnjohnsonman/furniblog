-- Gallery images (storage bucket: gallery)
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  category text not null default 'office',
  product_id uuid references public.products (id) on delete set null,
  published boolean not null default false,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_published_idx on public.gallery_images (published, sort_order);
create index if not exists gallery_images_category_idx on public.gallery_images (category);

alter table public.gallery_images enable row level security;

create policy "Public read published gallery"
  on public.gallery_images for select
  using (published = true);
