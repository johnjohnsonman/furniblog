-- PREPARED ONLY. Apply 047 before this file.
-- Batch 2: manufacturer-backed corrections for exact catalog variants.
begin;

update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object(
  'seatHeightMin', 40.6,
  'seatHeightMax', 52.1,
  'seatDepthMin', 38.1,
  'seatDepthMax', 45.7,
  'seatWidth', 53.8,
  'weightCapacityKg', 136
), updated_at = now()
where slug = 'herman-miller-embody-gaming';

update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object(
  'seatHeightMin', 37.6,
  'seatHeightMax', 54.4,
  'seatDepth', 40.4,
  'seatWidth', 52.1,
  'weightCapacityKg', 159
), updated_at = now()
where slug = 'herman-miller-cosm-high-back';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select p.id, v.field_key, 'manufacturer', v.source_title, v.source_url, date '2026-09-19', v.notes
from public.products p
join (values
  ('herman-miller-embody-gaming', 'seat_height', 'Herman Miller Embody Gaming Chair', 'https://store.hermanmiller.com/gaming/herman-miller-x-logitech-g-embody-gaming-chair/100206608.html?lang=en_US', 'US standard-height configuration; 16-20.5 inches converted to centimetres.'),
  ('herman-miller-embody-gaming', 'seat_depth', 'Herman Miller Embody Gaming Chair', 'https://store.hermanmiller.com/gaming/herman-miller-x-logitech-g-embody-gaming-chair/100206608.html?lang=en_US', 'Published adjustable range; 15-18 inches converted to centimetres.'),
  ('herman-miller-embody-gaming', 'seat_width', 'Herman Miller Embody Gaming Chair dimensions', 'https://esstore.hermanmiller.com/products/embody-gaming-chair', 'Published 538 mm seat width.'),
  ('herman-miller-embody-gaming', 'weight_capacity', 'Herman Miller Embody Gaming Chair', 'https://store.hermanmiller.com/gaming/herman-miller-x-logitech-g-embody-gaming-chair/100206608.html?lang=en_US', 'Published 300 lb capacity converted to 136 kg.'),
  ('herman-miller-cosm-high-back', 'seat_height', 'Herman Miller Cosm specifications', 'https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/specs/', 'US chair range; 14.8-21.4 inches converted to centimetres.'),
  ('herman-miller-cosm-high-back', 'seat_depth', 'Herman Miller Cosm specifications', 'https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/specs/', 'Published 15.9 inch seat depth converted to centimetres.'),
  ('herman-miller-cosm-high-back', 'seat_width', 'Herman Miller Cosm specifications', 'https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/specs/', 'Published 20.5 inch seat width converted to centimetres.'),
  ('herman-miller-cosm-high-back', 'weight_capacity', 'Herman Miller Cosm product sheet', 'https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/cosm_chairs_product_sheet.pdf', 'Published 350 lb maximum user weight converted to 159 kg.')
) as v(slug, field_key, source_title, source_url, notes) on p.slug = v.slug
on conflict(product_id, field_key, source_url) do update set
  source_title = excluded.source_title,
  checked_on = excluded.checked_on,
  notes = excluded.notes,
  updated_at = now();

commit;
