-- Backfill products.thumbnail_url from first product_images row (by sort_order)
update public.products
set thumbnail_url = (
  select url
  from public.product_images
  where product_id = products.id
  order by sort_order asc
  limit 1
)
where exists (
  select 1
  from public.product_images
  where product_id = products.id
);
