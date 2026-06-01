-- Unify the store experience form into review_sessions.
-- Run in Supabase SQL Editor (furniblog project). Idempotent.

-- 1) Allow the store form source value.
alter table public.review_sessions
  drop constraint if exists review_sessions_source_check;
alter table public.review_sessions
  add constraint review_sessions_source_check
  check (source in ('native', 'google_form', 'import_614', 'store_form'));

-- 2) The store form sends Korean/free-text values for these enum-ish columns,
--    so relax the remaining CHECKs to free text/null (height_band + age_band
--    were already relaxed in 021).
alter table public.review_sessions drop constraint if exists review_sessions_sex_check;
alter table public.review_sessions drop constraint if exists review_sessions_body_check;
alter table public.review_sessions drop constraint if exists review_sessions_sit_hours_check;

-- 3) Add the store-form-specific fields so no input is lost.
alter table public.review_sessions
  add column if not exists rating smallint,
  add column if not exists photo_url text,
  add column if not exists store_location text,
  add column if not exists comparing_chairs text,
  add column if not exists nickname text,
  add column if not exists standing_desk text;

alter table public.review_sessions
  drop constraint if exists review_sessions_rating_check;
alter table public.review_sessions
  add constraint review_sessions_rating_check
  check (rating is null or rating between 1 and 5);

-- 4) Retire the now-unused experience_reviews table (verified empty before drop).
drop table if exists public.experience_reviews;
