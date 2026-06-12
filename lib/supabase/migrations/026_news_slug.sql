-- Add SEO slug + "why it matters" editorial value-add to news.

alter table public.news
  add column if not exists slug text,
  add column if not exists why_it_matters text;

create unique index if not exists news_slug_key
  on public.news (slug);
