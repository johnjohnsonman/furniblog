-- Re-audit columns: store Claude's re-evaluation of how well an existing item
-- matches its assigned product/brand, so suspect items can be reviewed + deleted.

alter table public.reviews
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

alter table public.videos
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

alter table public.news
  add column if not exists audit_score numeric,
  add column if not exists audit_reason text,
  add column if not exists audited_at timestamptz;

create index if not exists reviews_audit_score_idx on public.reviews (audit_score);
create index if not exists videos_audit_score_idx on public.videos (audit_score);
create index if not exists news_audit_score_idx on public.news (audit_score);
