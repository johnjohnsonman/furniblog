-- Multiple images per brand (for the brand-detail hero carousel + listing
-- cover). brands is already anon-readable, so no extra grant is needed.
-- The first element is treated as the cover. NULL/empty = fall back to the
-- brand-colour wordmark.
alter table brands add column if not exists images text[] default '{}';
