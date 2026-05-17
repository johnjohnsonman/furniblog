-- Furniblog: chair-only site default
-- Keeps existing schema; ensures new products default to chair track.

alter table public.products
  alter column track set default 'chair';

-- Optional: align legacy category strings to chair category ids (run if needed)
-- update public.products set category = 'office' where category ilike '%office%';
-- update public.products set category = 'executive' where category ilike '%executive%';
-- update public.products set category = 'lounge' where category ilike '%lounge%';
