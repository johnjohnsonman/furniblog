-- Storage buckets and policies (run in Supabase SQL Editor if migration not applied)
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('gallery', 'gallery', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images');

create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Admin upload gallery"
  on storage.objects for insert
  with check (bucket_id = 'gallery');

create policy "Admin delete gallery"
  on storage.objects for delete
  using (bucket_id = 'gallery');
