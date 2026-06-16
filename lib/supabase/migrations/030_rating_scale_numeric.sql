-- Normalize product editorial rating columns to a consistent numeric(4,1)
-- 0–10 scale. Previously rating_overall was numeric(2,1) (max 9.9, overflowed
-- on a score of 10) and rating_comfort / rating_ergonomics were smallint with a
-- different (~0–100) intent. All rating columns are currently empty, so the
-- type change is lossless. Used by the editorial-ratings admin + recommender.
alter table public.products
  alter column rating_overall type numeric(4, 1),
  alter column rating_comfort type numeric(4, 1),
  alter column rating_ergonomics type numeric(4, 1);
