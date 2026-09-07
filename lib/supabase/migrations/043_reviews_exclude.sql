-- P1-3: reversibly hide confirmed mis-linked / unverified reviews from PUBLIC
-- DISPLAY and AGGREGATION, WITHOUT deleting them. This is a "hide from public
-- screens + counts" flag, NOT a security/RLS change — anon can still read rows
-- via the API unless RLS is separately tightened.
--
-- Not yet applied (reviews.excluded does not exist). Run the whole block:
begin;

alter table public.reviews add column if not exists excluded boolean not null default false;
alter table public.reviews add column if not exists exclude_reason text;
alter table public.reviews add column if not exists excluded_at timestamptz;

-- Fast path for "public, non-excluded reviews of a product".
create index if not exists reviews_excluded_idx on public.reviews (product_id, excluded);

commit;

-- Note: `add column if not exists` does NOT re-check an existing column's type /
-- default / nullability. After running, confirm:
--   select column_name, data_type, is_nullable, column_default
--   from information_schema.columns
--   where table_schema='public' and table_name='reviews'
--     and column_name in ('excluded','exclude_reason','excluded_at');
-- Expected: excluded boolean NOT NULL default false; the other two nullable.
