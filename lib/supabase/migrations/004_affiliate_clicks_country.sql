-- Add country column for affiliate click analytics
alter table public.affiliate_clicks
  add column if not exists country text;

create index if not exists affiliate_clicks_country_idx
  on public.affiliate_clicks (country);
