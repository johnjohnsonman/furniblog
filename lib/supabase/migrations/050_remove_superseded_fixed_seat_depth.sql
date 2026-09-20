-- PREPARED ONLY. Run after 048 and 049.
-- These products now have verified adjustable seatDepthMin/seatDepthMax ranges.
-- Remove the superseded fixed seatDepth key so machine-readable output cannot
-- expose two conflicting representations of the same measurement.
begin;

update public.products
set chair_specs = chair_specs - 'seatDepth', updated_at = now()
where slug in (
  'steelcase-leap-v2',
  'steelcase-gesture',
  'herman-miller-embody-gaming'
)
and chair_specs ? 'seatDepth'
and chair_specs ? 'seatDepthMin'
and chair_specs ? 'seatDepthMax';

commit;
