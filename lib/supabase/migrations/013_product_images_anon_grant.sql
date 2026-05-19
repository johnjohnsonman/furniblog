-- Allow anon/authenticated to read product_images (RLS: public read policy in 007)
grant select on public.product_images to anon, authenticated;
