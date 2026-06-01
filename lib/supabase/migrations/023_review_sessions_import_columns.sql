-- Prepare review_sessions for the 614-row store experience import.
-- Run in Supabase SQL Editor (furniblog project). Idempotent.

-- 1) Allow source='import_614' (016 only allowed native/google_form).
alter table public.review_sessions
  drop constraint if exists review_sessions_source_check;
alter table public.review_sessions
  add constraint review_sessions_source_check
  check (source in ('native', 'google_form', 'import_614'));

-- 2) Korean originals (main text columns hold the English translation),
--    plus a previous_chair column the base schema does not have.
alter table public.review_sessions
  add column if not exists comment_ko text,
  add column if not exists reasons_ko text[] not null default '{}',
  add column if not exists pain_ko text[] not null default '{}',
  add column if not exists job_ko text,
  add column if not exists previous_chair text,
  add column if not exists previous_chair_ko text;
