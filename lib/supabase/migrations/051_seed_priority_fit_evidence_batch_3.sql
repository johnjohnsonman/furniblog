-- GENERATED FILE. Review before running in Supabase SQL Editor.
-- Units: centimetres except weightCapacity, which is kilograms.
-- Requires migration 047_product_fit_evidence.sql.
begin;

-- Source row 2: haworth-fern
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.9, 'seatHeightMax', 54.6, 'seatDepthMin', 39.4, 'seatDepthMax', 47, 'seatWidth', 50.5, 'weightCapacityKg', 147.4), updated_at = now()
where slug = 'haworth-fern';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Haworth Fern Office Chair dimensions', 'https://store.haworth.com/products/fern-office-chair', date '2026-09-19', 'North American office-chair configuration; inches converted to centimetres and 325 lb warranty capacity converted to kilograms. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'haworth-fern'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Haworth Fern Office Chair dimensions', 'https://store.haworth.com/products/fern-office-chair', date '2026-09-19', 'North American office-chair configuration; inches converted to centimetres and 325 lb warranty capacity converted to kilograms. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'haworth-fern'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Haworth Fern Office Chair dimensions', 'https://store.haworth.com/products/fern-office-chair', date '2026-09-19', 'North American office-chair configuration; inches converted to centimetres and 325 lb warranty capacity converted to kilograms. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'haworth-fern'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Haworth Fern Office Chair dimensions', 'https://store.haworth.com/products/fern-office-chair', date '2026-09-19', 'North American office-chair configuration; inches converted to centimetres and 325 lb warranty capacity converted to kilograms. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'haworth-fern'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 3: humanscale-freedom
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 40.6, 'seatHeightMax', 53.3, 'seatDepthMin', 41.3, 'seatDepthMax', 47, 'seatWidth', 53.3), updated_at = now()
where slug = 'humanscale-freedom';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Humanscale Freedom Task and Headrest specification', 'https://apac.humanscale.com/userfiles/file/Hs_freedom-task-and-headrest_specification_english.pdf', date '2026-09-19', 'Standard chair configuration; compressed seat height and functional seat depth converted from official inches. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'humanscale-freedom'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Humanscale Freedom Task and Headrest specification', 'https://apac.humanscale.com/userfiles/file/Hs_freedom-task-and-headrest_specification_english.pdf', date '2026-09-19', 'Standard chair configuration; compressed seat height and functional seat depth converted from official inches. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'humanscale-freedom'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Humanscale Freedom Task and Headrest specification', 'https://apac.humanscale.com/userfiles/file/Hs_freedom-task-and-headrest_specification_english.pdf', date '2026-09-19', 'Standard chair configuration; compressed seat height and functional seat depth converted from official inches. Arm height is seat-relative and is not used as floor clearance.'
from public.products where slug = 'humanscale-freedom'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 4: knoll-regeneration
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.7, 'seatHeightMax', 54.9, 'seatDepthMin', 40.6, 'seatDepthMax', 45.7, 'seatWidth', 50, 'weightCapacityKg', 136.1, 'armrestFloorHeightMin', 57.2, 'armrestFloorHeightMax', 81), updated_at = now()
where slug = 'knoll-regeneration';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'ReGeneration by Knoll dimensions and operating instructions', 'https://www.knoll.com/media/569/74/KnollOfficeSeating%28PLOS1215%29%2C0.pdf', date '2026-09-19', 'Standard-cylinder work chair with high-performance arms; official inches converted to centimetres. Arm-to-floor values use the documented high-performance-arm configuration.'
from public.products where slug = 'knoll-regeneration'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'ReGeneration by Knoll dimensions and operating instructions', 'https://www.knoll.com/media/569/74/KnollOfficeSeating%28PLOS1215%29%2C0.pdf', date '2026-09-19', 'Standard-cylinder work chair with high-performance arms; official inches converted to centimetres. Arm-to-floor values use the documented high-performance-arm configuration.'
from public.products where slug = 'knoll-regeneration'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'ReGeneration by Knoll dimensions and operating instructions', 'https://www.knoll.com/media/569/74/KnollOfficeSeating%28PLOS1215%29%2C0.pdf', date '2026-09-19', 'Standard-cylinder work chair with high-performance arms; official inches converted to centimetres. Arm-to-floor values use the documented high-performance-arm configuration.'
from public.products where slug = 'knoll-regeneration'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'ReGeneration by Knoll dimensions and operating instructions', 'https://www.knoll.com/media/569/74/KnollOfficeSeating%28PLOS1215%29%2C0.pdf', date '2026-09-19', 'Standard-cylinder work chair with high-performance arms; official inches converted to centimetres. Arm-to-floor values use the documented high-performance-arm configuration.'
from public.products where slug = 'knoll-regeneration'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'armrest_floor_height', 'manufacturer', 'ReGeneration by Knoll dimensions and operating instructions', 'https://www.knoll.com/media/569/74/KnollOfficeSeating%28PLOS1215%29%2C0.pdf', date '2026-09-19', 'Standard-cylinder work chair with high-performance arms; official inches converted to centimetres. Arm-to-floor values use the documented high-performance-arm configuration.'
from public.products where slug = 'knoll-regeneration'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Stop the transaction if an input slug did not produce evidence.
do $$ begin if (select count(distinct p.slug) from public.products p join public.product_fit_evidence e on e.product_id = p.id where p.slug in ('haworth-fern', 'humanscale-freedom', 'knoll-regeneration')) < 3 then raise exception 'One or more product slugs were not found or produced no evidence'; end if; end $$;

commit;
