-- P1-3: reversibly exclude confirmed mis-linked / unverified reviews from
-- public display AND aggregation, WITHOUT deleting them (preserve the original
-- row + a reason for the change log). Set excluded=true to hide; excluded=false
-- to restore. No data is destroyed.
alter table reviews add column if not exists excluded boolean not null default false;
alter table reviews add column if not exists exclude_reason text;
alter table reviews add column if not exists excluded_at timestamptz;

-- Fast path for "public, non-excluded reviews of a product".
create index if not exists reviews_excluded_idx on reviews (product_id, excluded);
