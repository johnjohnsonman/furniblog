-- Product images (storage bucket: product-images)
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  is_thumbnail boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);
create index if not exists product_images_sort_idx on public.product_images (product_id, sort_order);

alter table public.product_images enable row level security;

create policy "Public read product_images"
  on public.product_images for select
  using (true);
