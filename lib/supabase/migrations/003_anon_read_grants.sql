-- Allow public (anon) API key to read published content via RLS policies.
-- Run in Supabase SQL Editor after 002_service_role_grants.sql

grant usage on schema public to anon, authenticated;

grant select on public.brands to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant select on public.affiliate_links to anon, authenticated;
grant select on public.designers to anon, authenticated;
