-- The app (both /api/affiliate/track and the admin analytics query) expects a
-- `country` column on affiliate_clicks, but the table was missing it — so every
-- click insert failed silently and the Analytics page errored with
-- "column affiliate_clicks.country does not exist". Add it back.
alter table affiliate_clicks add column if not exists country text;
