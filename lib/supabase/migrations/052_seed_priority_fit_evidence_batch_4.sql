-- GENERATED FILE. Review before running in Supabase SQL Editor.
-- Units: centimetres except weightCapacityKg, which is kilograms.
-- Requires migration 047_product_fit_evidence.sql.
begin;

-- Source row 2: steelcase-series-1
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.9, 'seatHeightMax', 54.6, 'seatDepthMin', 39.4, 'seatDepthMax', 45.1, 'seatWidth', 49.5, 'armrestFloorHeightMin', 58.4, 'armrestFloorHeightMax', 82.6), updated_at = now()
where slug = 'steelcase-series-1';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Steelcase Series 1 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-1-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Functional depth 15.5-17.75 inches; seat height 16.5-21.5; width 19.5; arm-to-floor 23-32.5. Optional cylinders and stools excluded.'
from public.products where slug = 'steelcase-series-1'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Steelcase Series 1 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-1-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Functional depth 15.5-17.75 inches; seat height 16.5-21.5; width 19.5; arm-to-floor 23-32.5. Optional cylinders and stools excluded.'
from public.products where slug = 'steelcase-series-1'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Steelcase Series 1 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-1-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Functional depth 15.5-17.75 inches; seat height 16.5-21.5; width 19.5; arm-to-floor 23-32.5. Optional cylinders and stools excluded.'
from public.products where slug = 'steelcase-series-1'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'armrest_floor_height', 'manufacturer', 'Steelcase Series 1 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-1-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Functional depth 15.5-17.75 inches; seat height 16.5-21.5; width 19.5; arm-to-floor 23-32.5. Optional cylinders and stools excluded.'
from public.products where slug = 'steelcase-series-1'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 3: steelcase-series-2
update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object('seatHeightMin', 41.9, 'seatHeightMax', 54.6, 'seatWidth', 50.8, 'armrestFloorHeightMin', 60.3, 'armrestFloorHeightMax', 83.2), updated_at = now()
where slug = 'steelcase-series-2';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Steelcase Series 2 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-2-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; width 20; arm-to-floor 23.75-32.75. Depth withheld because upholstered and AirBack variants differ; existing depth is not verified by this row.'
from public.products where slug = 'steelcase-series-2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Steelcase Series 2 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-2-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; width 20; arm-to-floor 23.75-32.75. Depth withheld because upholstered and AirBack variants differ; existing depth is not verified by this row.'
from public.products where slug = 'steelcase-series-2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'armrest_floor_height', 'manufacturer', 'Steelcase Series 2 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/series-2-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; width 20; arm-to-floor 23.75-32.75. Depth withheld because upholstered and AirBack variants differ; existing depth is not verified by this row.'
from public.products where slug = 'steelcase-series-2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 4: steelcase-think-v2
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.9, 'seatHeightMax', 54.6, 'seatDepthMin', 39.4, 'seatDepthMax', 45.7, 'seatWidth', 51.4), updated_at = now()
where slug = 'steelcase-think-v2';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Steelcase Think 465 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/think-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; functional depth 15.5-18; width 20.25. Arm-floor diagram appears inconsistent with adjustable arms and is withheld.'
from public.products where slug = 'steelcase-think-v2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Steelcase Think 465 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/think-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; functional depth 15.5-18; width 20.25. Arm-floor diagram appears inconsistent with adjustable arms and is withheld.'
from public.products where slug = 'steelcase-think-v2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Steelcase Think 465 February 2024 specification guide', 'https://www.steelcase.com/resources/documents/think-spec-guide/', date '2026-09-20', 'Standard work-chair cylinder. Seat height 16.5-21.5 inches; functional depth 15.5-18; width 20.25. Arm-floor diagram appears inconsistent with adjustable arms and is withheld.'
from public.products where slug = 'steelcase-think-v2'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 5: steelcase-amia
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 40.6, 'seatHeightMax', 53.3, 'seatDepthMin', 39.4, 'seatDepthMax', 47, 'seatWidth', 49.2), updated_at = now()
where slug = 'steelcase-amia';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Steelcase Seating April 2021 specification guide page 132', 'https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf', date '2026-09-20', 'Standard Amia work chair. Seat height 16-21 inches; functional depth 15.5-18.5; width 19.375. Arm-floor values differ across revisions and are withheld.'
from public.products where slug = 'steelcase-amia'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Steelcase Seating April 2021 specification guide page 132', 'https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf', date '2026-09-20', 'Standard Amia work chair. Seat height 16-21 inches; functional depth 15.5-18.5; width 19.375. Arm-floor values differ across revisions and are withheld.'
from public.products where slug = 'steelcase-amia'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Steelcase Seating April 2021 specification guide page 132', 'https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf', date '2026-09-20', 'Standard Amia work chair. Seat height 16-21 inches; functional depth 15.5-18.5; width 19.375. Arm-floor values differ across revisions and are withheld.'
from public.products where slug = 'steelcase-amia'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 6: steelcase-karman
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepthMin' - 'seatDepthMax') || jsonb_build_object('seatHeightMin', 40.2, 'seatHeightMax', 51.9, 'seatDepth', 43.8), updated_at = now()
where slug = 'steelcase-karman';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Steelcase Karman specification guide March 2023', 'https://www.steelcase.com/content/uploads/2023/03/Karman-Spec-Guide.pdf', date '2026-09-20', 'Standard work-chair cylinder. Height 15.8125-20.4375 inches; fixed seat depth 17.25. Low and high cylinders and stools excluded. Fixed depth replaces any stale adjustable-depth keys.'
from public.products where slug = 'steelcase-karman'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Steelcase Karman specification guide March 2023', 'https://www.steelcase.com/content/uploads/2023/03/Karman-Spec-Guide.pdf', date '2026-09-20', 'Standard work-chair cylinder. Height 15.8125-20.4375 inches; fixed seat depth 17.25. Low and high cylinders and stools excluded. Fixed depth replaces any stale adjustable-depth keys.'
from public.products where slug = 'steelcase-karman'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 7: branch-ergonomic-chair
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 43.2, 'seatHeightMax', 53.3, 'seatDepthMin', 45.7, 'seatDepthMax', 55.9, 'weightCapacityKg', 124.7), updated_at = now()
where slug = 'branch-ergonomic-chair';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Branch Ergonomic Chair product specifications', 'https://www.branchfurniture.com/collections/ergonomic-collection/products/ergonomic-chair', date '2026-09-20', 'Standard original Ergonomic Chair; not Pro or Lite. Published height 17-21 inches and depth 18-22. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-ergonomic-chair'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Branch Ergonomic Chair product specifications', 'https://www.branchfurniture.com/collections/ergonomic-collection/products/ergonomic-chair', date '2026-09-20', 'Standard original Ergonomic Chair; not Pro or Lite. Published height 17-21 inches and depth 18-22. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-ergonomic-chair'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Branch Ergonomic Chair product specifications', 'https://www.branchfurniture.com/collections/ergonomic-collection/products/ergonomic-chair', date '2026-09-20', 'Standard original Ergonomic Chair; not Pro or Lite. Published height 17-21 inches and depth 18-22. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-ergonomic-chair'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 8: branch-verve
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.9, 'seatHeightMax', 52.1, 'seatDepthMin', 41.9, 'seatDepthMax', 48.3, 'weightCapacityKg', 124.7), updated_at = now()
where slug = 'branch-verve';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Branch Verve product specifications', 'https://www.branchfurniture.com/collections/seating/products/verve-chair', date '2026-09-20', 'Published seat height 16.5-20.5 inches and depth 16.5-19. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-verve'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Branch Verve product specifications', 'https://www.branchfurniture.com/collections/seating/products/verve-chair', date '2026-09-20', 'Published seat height 16.5-20.5 inches and depth 16.5-19. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-verve'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Branch Verve product specifications', 'https://www.branchfurniture.com/collections/seating/products/verve-chair', date '2026-09-20', 'Published seat height 16.5-20.5 inches and depth 16.5-19. Capacity 275 lb. Arm-height reference origin not explicit so floor clearance withheld.'
from public.products where slug = 'branch-verve'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 9: herman-miller-embody
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 40.6, 'seatHeightMax', 52.1, 'seatDepthMin', 38.1, 'seatDepthMax', 45.7, 'weightCapacityKg', 136.1), updated_at = now()
where slug = 'herman-miller-embody';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Herman Miller Embody US product dimensions', 'https://store.hermanmiller.com/office-chairs-ergonomic-chairs/embody-chair/100147379.html?lang=en_US', date '2026-09-20', 'US standard-height office Embody; not Gaming. Seat height 16-20.5 inches; depth 15-18; capacity 300 lb. Other cylinder options excluded.'
from public.products where slug = 'herman-miller-embody'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Herman Miller Embody US product dimensions', 'https://store.hermanmiller.com/office-chairs-ergonomic-chairs/embody-chair/100147379.html?lang=en_US', date '2026-09-20', 'US standard-height office Embody; not Gaming. Seat height 16-20.5 inches; depth 15-18; capacity 300 lb. Other cylinder options excluded.'
from public.products where slug = 'herman-miller-embody'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Herman Miller Embody US product dimensions', 'https://store.hermanmiller.com/office-chairs-ergonomic-chairs/embody-chair/100147379.html?lang=en_US', date '2026-09-20', 'US standard-height office Embody; not Gaming. Seat height 16-20.5 inches; depth 15-18; capacity 300 lb. Other cylinder options excluded.'
from public.products where slug = 'herman-miller-embody'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 10: herman-miller-lino
update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object('weightCapacityKg', 159), updated_at = now()
where slug = 'herman-miller-lino';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Herman Miller Lino product sheet', 'https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/lino_chairs_product_sheet.pdf', date '2026-09-20', 'Manufacturer explicitly publishes 159 kg capacity. Seat dimensions withheld pending fixed-versus-adjustable and regional configuration resolution.'
from public.products where slug = 'herman-miller-lino'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 11: okamura-contessa-ii
update public.products
set chair_specs = coalesce(chair_specs, '{}'::jsonb) || jsonb_build_object('weightCapacityKg', 136), updated_at = now()
where slug = 'okamura-contessa-ii';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Okamura Contessa II official product page', 'https://www.okamura.com/products/contessa-ii/', date '2026-09-20', 'Official tested user weight 136 kg. Seat and arm dimensions withheld pending regional and seat-material configuration resolution.'
from public.products where slug = 'okamura-contessa-ii'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Stop the transaction if an input slug did not produce evidence.
do $$ begin if (select count(distinct p.slug) from public.products p join public.product_fit_evidence e on e.product_id = p.id where p.slug in ('steelcase-series-1', 'steelcase-series-2', 'steelcase-think-v2', 'steelcase-amia', 'steelcase-karman', 'branch-ergonomic-chair', 'branch-verve', 'herman-miller-embody', 'herman-miller-lino', 'okamura-contessa-ii')) < 10 then raise exception 'One or more product slugs were not found or produced no evidence'; end if; end $$;

commit;
