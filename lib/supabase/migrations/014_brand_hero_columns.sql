-- Brand hero, long description, and theme colors
alter table public.brands
  add column if not exists hero_image_url text,
  add column if not exists description_long text,
  add column if not exists color_primary text default '#1A1A1A',
  add column if not exists color_secondary text default '#6B6B6B';

update public.brands
set color_primary = '#1A1A1A', color_secondary = '#4A4A4A'
where slug = 'herman-miller';

update public.brands
set color_primary = '#003087', color_secondary = '#0050CC'
where slug = 'steelcase';

update public.brands
set color_primary = '#1B4332', color_secondary = '#2D6A4F'
where slug = 'okamura';

update public.brands
set color_primary = '#8B6914', color_secondary = '#B8860B'
where slug = 'humanscale';

update public.brands
set color_primary = '#F5F5F0', color_secondary = '#D4D4C8'
where slug = 'hag-flokk';

update public.brands
set color_primary = '#E8E8E8', color_secondary = '#B0B0B0'
where slug = 'vitra';

update public.brands
set color_primary = '#2E4057', color_secondary = '#3A5068'
where slug = 'knoll';

update public.brands
set color_primary = '#1B5E20', color_secondary = '#2E7D32'
where slug = 'haworth';

update public.brands
set color_primary = '#2E4057', color_secondary = '#3A5068'
where slug = 'sidiz';
