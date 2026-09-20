-- GENERATED FILE. Review before running in Supabase SQL Editor.
-- Units: centimetres except weightCapacityKg, which is kilograms.
-- Requires migration 047_product_fit_evidence.sql.
begin;

-- Source row 2: haworth-soji
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 41.7, 'seatHeightMax', 53.3, 'seatDepthMin', 41.3, 'seatDepthMax', 47.6, 'seatWidth', 50.8, 'weightCapacityKg', 158.8), updated_at = now()
where slug = 'haworth-soji';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Haworth Soji US office chair current product dimensions', 'https://store.haworth.com/products/soji-office-chair', date '2026-09-20', 'US standard Soji office chair with sliding seat; not XL or stool. Height 16.4-21 inches; seat depth 16.25-18.75; width 20; warranted user weight 350 lb. Inches and pounds converted to cm and kg. Published arm height lacks explicit floor datum and is excluded. Regional configurations may differ.'
from public.products where slug = 'haworth-soji'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Haworth Soji US office chair current product dimensions', 'https://store.haworth.com/products/soji-office-chair', date '2026-09-20', 'US standard Soji office chair with sliding seat; not XL or stool. Height 16.4-21 inches; seat depth 16.25-18.75; width 20; warranted user weight 350 lb. Inches and pounds converted to cm and kg. Published arm height lacks explicit floor datum and is excluded. Regional configurations may differ.'
from public.products where slug = 'haworth-soji'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Haworth Soji US office chair current product dimensions', 'https://store.haworth.com/products/soji-office-chair', date '2026-09-20', 'US standard Soji office chair with sliding seat; not XL or stool. Height 16.4-21 inches; seat depth 16.25-18.75; width 20; warranted user weight 350 lb. Inches and pounds converted to cm and kg. Published arm height lacks explicit floor datum and is excluded. Regional configurations may differ.'
from public.products where slug = 'haworth-soji'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Haworth Soji US office chair current product dimensions', 'https://store.haworth.com/products/soji-office-chair', date '2026-09-20', 'US standard Soji office chair with sliding seat; not XL or stool. Height 16.4-21 inches; seat depth 16.25-18.75; width 20; warranted user weight 350 lb. Inches and pounds converted to cm and kg. Published arm height lacks explicit floor datum and is excluded. Regional configurations may differ.'
from public.products where slug = 'haworth-soji'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Source row 3: haworth-very-task
update public.products
set chair_specs = (coalesce(chair_specs, '{}'::jsonb) - 'seatDepth') || jsonb_build_object('seatHeightMin', 40.6, 'seatHeightMax', 53.3, 'seatDepthMin', 40.6, 'seatDepthMax', 48.3, 'seatWidth', 48.3, 'weightCapacityKg', 147.4), updated_at = now()
where slug = 'haworth-very-task';

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_height', 'manufacturer', 'Haworth Very US task chair current product dimensions', 'https://store.haworth.com/products/very-office-chair', date '2026-09-20', 'US Very task chair with adjustable seat; not conference or stacking chair. Height 16-21 inches; depth 16-19; width 19. Capacity uses the lower 325 lb forward-tilt configuration; the no-forward-tilt option is separately warranted to 350 lb. Arm height is not used as floor clearance. Regional configurations may differ.'
from public.products where slug = 'haworth-very-task'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_depth', 'manufacturer', 'Haworth Very US task chair current product dimensions', 'https://store.haworth.com/products/very-office-chair', date '2026-09-20', 'US Very task chair with adjustable seat; not conference or stacking chair. Height 16-21 inches; depth 16-19; width 19. Capacity uses the lower 325 lb forward-tilt configuration; the no-forward-tilt option is separately warranted to 350 lb. Arm height is not used as floor clearance. Regional configurations may differ.'
from public.products where slug = 'haworth-very-task'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'seat_width', 'manufacturer', 'Haworth Very US task chair current product dimensions', 'https://store.haworth.com/products/very-office-chair', date '2026-09-20', 'US Very task chair with adjustable seat; not conference or stacking chair. Height 16-21 inches; depth 16-19; width 19. Capacity uses the lower 325 lb forward-tilt configuration; the no-forward-tilt option is separately warranted to 350 lb. Arm height is not used as floor clearance. Regional configurations may differ.'
from public.products where slug = 'haworth-very-task'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

insert into public.product_fit_evidence
  (product_id, field_key, evidence_type, source_title, source_url, checked_on, notes)
select id, 'weight_capacity', 'manufacturer', 'Haworth Very US task chair current product dimensions', 'https://store.haworth.com/products/very-office-chair', date '2026-09-20', 'US Very task chair with adjustable seat; not conference or stacking chair. Height 16-21 inches; depth 16-19; width 19. Capacity uses the lower 325 lb forward-tilt configuration; the no-forward-tilt option is separately warranted to 350 lb. Arm height is not used as floor clearance. Regional configurations may differ.'
from public.products where slug = 'haworth-very-task'
on conflict(product_id, field_key, source_url) do update set source_title = excluded.source_title, evidence_type = excluded.evidence_type, checked_on = excluded.checked_on, notes = excluded.notes, updated_at = now();

-- Stop the transaction if an input slug did not produce evidence.
do $$ begin if (select count(distinct p.slug) from public.products p join public.product_fit_evidence e on e.product_id = p.id where p.slug in ('haworth-soji', 'haworth-very-task')) < 2 then raise exception 'One or more product slugs were not found or produced no evidence'; end if; end $$;

commit;
