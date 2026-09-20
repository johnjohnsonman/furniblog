# Chair Fit Calculator — Implementation Status

Updated: 2026-09-19

## Implemented

- The calculator reads live Chairpedia product records through the existing Supabase data layer.
- Product imagery prefers the first verified `product_images` record by `sort_order`, then falls back to `thumbnail_url`, then to the designed missing-image treatment.
- The recommendation endpoint evaluates up to ten candidates.
- Awards are calculated independently and merged onto one product card. One chair may hold several awards.
- Results are separated into evidence-backed standout matches and compact compatible alternatives.
- `Strong alternative` requires a near-tie or a concrete price or desk-clearance advantage.
- Fit Score is presented as a 0–100 evidence index, never as a probability.
- Relevant unpublished measurements remain in the Fit Score denominator and reduce confidence instead of silently disappearing.
- Product record freshness and exact-model versus brand-carried showroom counts remain visible.
- A repeatable live-catalog audit now measures fit-data and verified-image coverage and writes both Markdown and JSON reports.
- A reviewed-but-not-applied migration defines field-level measurement provenance with source URL, source type, and checked date.
- Calculator metadata now targets descriptive chair-fit queries and explains the result model in answer-first language.
- Visible FAQ content and matching `WebPage`, `WebApplication`, `BreadcrumbList`, and `FAQPage` structured data have been added for search and generative retrieval.
- Editorial policy, chair reference, and showroom pages are linked as the calculator's authority graph.
- Recommendation data is prefetched while the user completes the desk step, reducing the wait after opening the fit passport.
- Catalog and approved-review reads use a five-minute server-process cache with in-flight request deduplication; failures are never cached.
- The top-20 evidence queue is now selected from real approved first-choice picks instead of a manually chosen product list.
- Official manufacturer dimensions were reviewed for the first five priority products. Leap V2 and Gesture have a prepared correction/provenance migration; Aeron, Contessa II, and Freedom are held until their model variants are explicit.
- Embody Gaming and Cosm High Back now have a second prepared manufacturer-backed correction batch.
- Recommendation cards read field-level source records when the provenance table exists and show source title, type, URL, and checked date. Deployments without the table continue safely with the existing record-date disclosure.
- Live verification confirms 16 field-level evidence rows across Leap V2, Gesture, Embody Gaming, and Cosm High Back. Leap V2 and Gesture now have complete core evidence including floor-based armrest clearance.
- A reusable showroom batch importer now accepts CSV/XLSX/JSON, resolves catalog slugs, rejects likely duplicates, holds incomplete publish requests as drafts, and writes an audit report before any registry change.
- A reusable chair-fit evidence generator now validates source-backed CSV/XLSX rows and produces reviewable, transactional Supabase SQL with stale fixed/range seat-depth cleanup.
- A third manufacturer-backed batch is prepared for Haworth Fern, Humanscale Freedom, and Knoll ReGeneration. Variant-specific floor clearance remains unknown unless the official source states a floor-based range for the represented configuration.

## Live catalog audit

Audit run: 2026-09-19

- Published chairs: **236**
- Fit-ready with seat height and seat depth: **142 (60.2%)**
- Verified product image: **236 (100%)**
- Floor-to-armrest height: **2 (0.8%)**
- Full core evidence: **2 (0.8%)**

The image layer is ready for the current catalog. The next material quality gain comes from verified measurement provenance, especially floor-to-armrest height, rather than sourcing more images.

## Validation

- `npm.cmd run test:chair-fit` passes.
- `npx.cmd tsc --noEmit` passes.
- Targeted ESLint checks pass.
- `npm.cmd run audit:chair-fit-coverage` completes against the live catalog.
- The production build reaches asset compilation but cannot complete in the restricted environment because `next/font` cannot download Inter and Playfair Display from Google Fonts.

## Next work

1. Review and run `051_seed_priority_fit_evidence_batch_3.sql`, then rerun the live coverage audit.
2. Import the representative's first showroom spreadsheet in preview mode, resolve all rejected/held rows, then write and run the three showroom validators.
3. Define variant handling for Aeron sizes and Contessa II regional configurations before changing their canonical dimensions.
4. Research and enter floor-to-armrest ranges for the remaining priority chairs only when manufacturers publish that exact floor-based measurement; otherwise keep it unknown.
5. Complete the records missing either seat height or seat depth, using the generated completion queue as the worklist.
6. Connect market-specific price records and availability so value awards use current regional evidence.
7. Validate exact-model showroom links against the production showroom registry and expose verification dates.
8. Add privacy-safe saved-result tokens and complete Fit Passport sharing without readable body values in public URLs.
9. Run real-device accessibility and interaction QA at 360, 390, 430, 768, 1024, 1180, and 1440 px.
10. Add analytics for calculator completion, evidence expansion, product dossier visits, comparisons, and showroom handoffs.
11. Measure every stage transition and API request on desktop and mobile after the prefetch/cache improvement; profile remaining recommendation latency, image decoding, React re-rendering, and motion duration before setting a performance budget. This remains a required follow-up because stage changes were reported as slow.

## Working files

- Live coverage report: `content/reports/chair-fit-coverage-2026-09-19.md`
- Machine-readable coverage data: `content/reports/chair-fit-coverage-2026-09-19.json`
- Repeatable audit command: `npm.cmd run audit:chair-fit-coverage`
- Prepared provenance migration: `lib/supabase/migrations/047_product_fit_evidence.sql`
- First-five source review: `design-handoff/chair-fit-priority-evidence-review.md`
- Prepared Leap/Gesture correction: `lib/supabase/migrations/048_seed_priority_fit_evidence.sql`
- Prepared Embody Gaming/Cosm correction: `lib/supabase/migrations/049_seed_priority_fit_evidence_batch_2.sql`
- Prepared adjustable-depth cleanup: `lib/supabase/migrations/050_remove_superseded_fixed_seat_depth.sql`
- Prepared Fern/Freedom/ReGeneration batch: `lib/supabase/migrations/051_seed_priority_fit_evidence_batch_3.sql`
- Chair evidence batch template: `content/chair-fit-import/chair-fit-evidence-template.csv`
- Showroom batch template: `content/showrooms/import/showrooms-template.csv`
