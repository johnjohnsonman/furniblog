-- Fix: the public site (anon key) gets "permission denied for table chairpedia"
-- because the table was created via SQL without granting SELECT to the anon /
-- authenticated roles. RLS still restricts rows to published; the grant just
-- lets those roles reach the table at all. Run in the Supabase SQL Editor.

grant select on public.chairpedia to anon, authenticated;

-- Ensure RLS + the published-only read policy are in place (idempotent).
alter table public.chairpedia enable row level security;

drop policy if exists "chairpedia public read published" on public.chairpedia;
create policy "chairpedia public read published"
  on public.chairpedia for select
  using (status = 'published');
