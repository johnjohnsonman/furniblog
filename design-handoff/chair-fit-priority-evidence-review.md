# Chair Fit — Priority Evidence Review

Updated: 2026-09-19

## Selection method

The first 20 records are selected only from fit-ready products, ordered by approved first-choice picks, then review volume, editorial rating, and name. The generated source list is in `content/reports/chair-fit-coverage-2026-09-19.md`.

## First five findings

### Herman Miller Aeron

- Official source: https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/
- The manufacturer publishes separate A, B, and C dimensions.
- The current Chairpedia record is generic while its 43 cm seat depth resembles Size B.
- Do not add a single floor-to-armrest range or overwrite the record until the product is explicitly assigned to A, B, C, or separate variants. Manufacturer arm height is presented relative to the seat.

### Okamura Contessa II

- Official product source: https://www.okamura.com/products/contessa-ii/
- Official specification guide: https://www.okamura.com/content/dam/okamura/resources/documents/spec-guide/contessa-ii/Contessa-II_Spec-Guide_BIFMA_mm_2310.pdf
- Regional model, material, cylinder, arm, and caster combinations affect dimensions.
- Hold automatic correction until the catalog record's exact configuration is defined.

### Steelcase Leap V2

- Official source: https://www.steelcase.com/resources/documents/leap-spec-guide/
- Work-chair seat height: 15.5–20.5 in → 39.4–52.1 cm.
- Functional seat depth: 15.75–18.75 in → 40.0–47.6 cm.
- Seat width: 19.25 in → 48.9 cm.
- Arm to floor: 22–31 in → 55.9–78.7 cm.
- The current 40–57 cm seat-height range and fixed 48 cm depth should be replaced by the published ranges.

### Humanscale Freedom

- Current official product page: https://www.humanscale.com/products/seating/freedom-task-office-chair/custom
- Manufacturer dimensional reference located in the Humanscale Freedom specification material.
- Cylinder and arm options change the usable ranges. Arm height is published relative to the compressed seat rather than directly from the floor.
- Do not derive floor clearance by adding independent minimums or maximums; their adjustment relationship is not documented.

### Steelcase Gesture

- Official source: https://www.steelcase.com/content/uploads/2024/02/Gesture-Spec-Guide.pdf
- Standard work-chair seat height: 16–21 in → 40.6–53.3 cm.
- Functional seat depth: 15.75–18.5 in → 40.0–47.0 cm.
- Seat width: 20 in → 50.8 cm.
- Arm to floor: 23.375–32.6875 in → 59.4–83.0 cm.
- The current 40–57 cm seat-height range and fixed 43 cm depth should be replaced by the published ranges.

## Prepared database work

`lib/supabase/migrations/048_seed_priority_fit_evidence.sql` corrects Leap V2 and Gesture and inserts field-level manufacturer provenance. It deliberately leaves Aeron, Contessa II, and Freedom unchanged until their variant definitions are resolved.

`lib/supabase/migrations/049_seed_priority_fit_evidence_batch_2.sql` corrects the explicitly named Embody Gaming and Cosm High Back records and adds their manufacturer sources. ReGeneration, Fern, and World One remain unchanged where the located official material does not safely establish every needed configuration-specific value.

Production verification on 2026-09-19 confirms that `047_product_fit_evidence.sql`, `048_seed_priority_fit_evidence.sql`, and `049_seed_priority_fit_evidence_batch_2.sql` have been applied successfully: 16 evidence rows exist across four products.

After the first three migrations, run `050_remove_superseded_fixed_seat_depth.sql`. It removes the old fixed `seatDepth` value from Leap V2, Gesture, and Embody Gaming after their verified adjustable ranges have been stored.
