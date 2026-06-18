-- Async AI generation: track background generation state on the entry so the
-- editor can fire-and-poll instead of holding a 90s+ HTTP request open.
-- Run this in the Supabase SQL Editor.

alter table public.chairpedia add column if not exists gen_status text;  -- null | 'generating' | 'done' | 'error'
alter table public.chairpedia add column if not exists gen_error text;
alter table public.chairpedia add column if not exists gen_started_at timestamptz;
alter table public.chairpedia add column if not exists gen_sources text[] not null default '{}';
