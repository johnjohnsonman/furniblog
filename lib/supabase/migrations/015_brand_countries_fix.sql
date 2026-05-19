-- Ensure Korean and other brand countries are set correctly

UPDATE public.brands
SET country = 'KR', updated_at = now()
WHERE slug IN ('sidiz', 'fursys')
  AND (country IS NULL OR country <> 'KR');

-- Insert Fursys if missing (products may reference it after seed:additional)
INSERT INTO public.brands (slug, name, country, tier, founded_year, website_url, description_ko)
VALUES (
  'fursys',
  'Fursys',
  'KR',
  'premium',
  1984,
  'https://www.fursys.com',
  'Leading Korean office furniture brand known for Tim, Slim, and Aria chair series.'
)
ON CONFLICT (slug) DO UPDATE SET
  country = EXCLUDED.country,
  name = EXCLUDED.name,
  website_url = COALESCE(public.brands.website_url, EXCLUDED.website_url),
  updated_at = now();
