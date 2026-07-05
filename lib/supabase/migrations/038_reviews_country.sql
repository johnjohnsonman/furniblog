-- Country-aware reviews: add a `country` column so reviews can be grouped by
-- where the review originated (KR for naver/dcinside, JP for japan_community,
-- the channel/language country for YouTube, US for English communities, etc.).
-- ISO 3166-1 alpha-2, uppercase (e.g. 'US', 'KR', 'JP', 'DE', 'IN').
-- NULL = unknown/ungrouped. Backfilled by scripts; new reviews tag at collection.
alter table reviews add column if not exists country text;

create index if not exists reviews_country_idx on reviews (country);
