-- Add product links + Korean-original columns to experience_reviews
-- for the 614-row store experience import.
-- Run in Supabase SQL Editor (furniblog project).

alter table public.experience_reviews
  add column if not exists rank1_product_id uuid references public.products(id) on delete set null,
  add column if not exists rank2_product_id uuid references public.products(id) on delete set null,
  add column if not exists rank3_product_id uuid references public.products(id) on delete set null,
  -- Korean originals preserved when main text columns hold the English translation.
  add column if not exists review_text_ko text,
  add column if not exists selection_reasons_ko text[] not null default '{}',
  add column if not exists pain_areas_ko text[] not null default '{}',
  add column if not exists job_ko text,
  add column if not exists previous_chair_ko text;

create index if not exists experience_reviews_rank1_product_idx
  on public.experience_reviews (rank1_product_id);
create index if not exists experience_reviews_rank2_product_idx
  on public.experience_reviews (rank2_product_id);
create index if not exists experience_reviews_rank3_product_idx
  on public.experience_reviews (rank3_product_id);
