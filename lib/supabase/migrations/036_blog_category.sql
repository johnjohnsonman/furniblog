-- Blog: add a topic category for the magazine-style index (Featured + tabs).
-- Run this in the Supabase SQL Editor (after 035).

alter table public.blog_posts add column if not exists category text;

create index if not exists blog_posts_category_idx on public.blog_posts (category);

-- Backfill categories for posts created before this column existed.
-- (New posts get a category from the AI converter automatically.)
update public.blog_posts set category = 'Comparisons'
  where category is null and title ilike '%vs%';
update public.blog_posts set category = 'Design Stories'
  where category is null and (title ilike '%eames%' or title ilike '%design icon%');
update public.blog_posts set category = 'Reviews'
  where category is null and (title ilike '%review%' or title ilike '%kokuyo%');
update public.blog_posts set category = 'Guides'
  where category is null;
