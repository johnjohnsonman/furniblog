-- Fix: review_sessions_height_band_check (and age_band) violations.
--
-- Migration 016 created CHECK constraints with the OLD value encoding
-- ('~160','160s',... / '10s',...'50s+'), but the wizard form + the public
-- /reviews reader use the English encoding ('under_5_4',... / 'under20',...).
-- Height/age are OPTIONAL fields, so the safest fix is to drop the value
-- CHECK constraints entirely and keep the columns as nullable free text.
--
-- Idempotent: works whether the DB currently has the 016 or 017 version
-- of these constraints. Run once in the Supabase SQL Editor.

alter table public.review_sessions
  drop constraint if exists review_sessions_height_band_check;

alter table public.review_sessions
  drop constraint if exists review_sessions_age_band_check;

-- Columns stay nullable text (no NOT NULL), so null / any value is accepted.
