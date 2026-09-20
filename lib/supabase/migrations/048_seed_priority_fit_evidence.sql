-- PREPARED ONLY. Review, apply 047 first, then run this migration.
-- Corrects two high-priority records where the current generic values differ
-- from manufacturer specification guides. Values are centimetres, rounded to
-- one decimal from the source inches. Existing unrelated chair_specs keys stay.
begin;

update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object(
  'seatHeightMin', 39.4,
  'seatHeightMax', 52.1,
  'seatDepthMin', 40.0,
  'seatDepthMax', 47.6,
  'seatWidth', 48.9,
  'armrestFloorHeightMin', 55.9,
  'armrestFloorHeightMax', 78.7
), updated_at = now()
where slug = 'steelcase-leap-v2';

update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object(
  'seatHeightMin', 40.6,
  'seatHeightMax', 53.3,
  'seatDepthMin', 40.0,
  'seatDepthMax', 47.0,
  'seatWidth', 50.8,
  'armrestFloorHeightMin', 59.4,
  'armrestFloorHeightMax', 83.0
), updated_at = now()
where slug = 'steelcase-gesture';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select p.id, v.field_key, 'manufacturer', v.source_title, v.source_url, date '2026-09-19', v.notes
from public.products p
join (values
  ('steelcase-leap-v2', 'seat_height', 'Steelcase Leap 462 Series Specification Guide', 'https://www.steelcase.com/resources/documents/leap-spec-guide/', 'BIFMA CMD dimensions; 15.5-20.5 inches converted to centimetres.'),
  ('steelcase-leap-v2', 'seat_depth', 'Steelcase Leap 462 Series Specification Guide', 'https://www.steelcase.com/resources/documents/leap-spec-guide/', 'Functional seat depth; 15.75-18.75 inches converted to centimetres.'),
  ('steelcase-leap-v2', 'seat_width', 'Steelcase Leap 462 Series Specification Guide', 'https://www.steelcase.com/resources/documents/leap-spec-guide/', '19.25 inches converted to centimetres.'),
  ('steelcase-leap-v2', 'armrest_floor_height', 'Steelcase Leap 462 Series Specification Guide', 'https://www.steelcase.com/resources/documents/leap-spec-guide/', 'Work-chair arm-to-floor range; 22-31 inches converted to centimetres.'),
  ('steelcase-gesture', 'seat_height', 'Steelcase Gesture 442 Series Specification Guide', 'https://www.steelcase.com/content/uploads/2024/02/Gesture-Spec-Guide.pdf', 'Standard work-chair range; 16-21 inches converted to centimetres.'),
  ('steelcase-gesture', 'seat_depth', 'Steelcase Gesture 442 Series Specification Guide', 'https://www.steelcase.com/content/uploads/2024/02/Gesture-Spec-Guide.pdf', 'Functional seat depth; 15.75-18.5 inches converted to centimetres.'),
  ('steelcase-gesture', 'seat_width', 'Steelcase Gesture 442 Series Specification Guide', 'https://www.steelcase.com/content/uploads/2024/02/Gesture-Spec-Guide.pdf', '20 inches converted to centimetres.'),
  ('steelcase-gesture', 'armrest_floor_height', 'Steelcase Gesture 442 Series Specification Guide', 'https://www.steelcase.com/content/uploads/2024/02/Gesture-Spec-Guide.pdf', 'Standard work-chair arm-to-floor range; 23.375-32.6875 inches converted to centimetres.')
) as v(slug, field_key, source_title, source_url, notes) on p.slug = v.slug
on conflict(product_id, field_key, source_url) do update set
  source_title = excluded.source_title,
  checked_on = excluded.checked_on,
  notes = excluded.notes,
  updated_at = now();

commit;
