# Chairpedia expansion — 2026-09-20

## Verified live baseline

Migration 051 is applied: 236 chairs, 142 fit-ready, 28 field evidence records across 7 products, and 3 products with all core numeric fields. These are coverage counts, not independent certification of every existing catalog value.

## Prepared SQL (not executed)

`lib/supabase/migrations/052_seed_priority_fit_evidence_batch_4.sql` updates 10 existing products and adds 26 source records. It does not create 10 new catalog products. All source URLs and configuration notes are in `content/chair-fit-import/priority-batch-4.csv` and the SQL itself.

- Height and depth: Series 1, Think V2, Amia, Karman, Branch Ergonomic, Branch Verve, Embody.
- Partial: Series 2 height/width/arm-floor; Lino and Contessa II capacity only.
- Series 2 depth is held because upholstered and AirBack configurations differ.
- Lino dimensions are held because regional documents and configurations disagree.
- Think and Amia arm-floor values are held because source diagrams/revisions need reconciliation.
- Existing unspecified fields remain unchanged; a new source does not validate those old values.
- Standard-cylinder/market assumptions are documented; model-wide values are not promises for every optional configuration.

Validated in local PostgreSQL (PGlite): 10 products / 26 records, idempotency, preserved unrelated JSON, fixed versus range depth cleanup, and transaction rollback on a missing slug.

## Showrooms

Haworth Dubai was added to the local registry: 679 published entries, 46 countries. Official source: https://www.haworth.com/eu/en/spaces/showrooms/dubai.html. The official map link resolves to place coordinates 25.1890674, 55.297806. Exact-model trials remain unknown. No deployment was performed.

Melbourne, Shanghai and Sydney official addresses were researched and saved in `content/showrooms/research/haworth-held-20260920.json`. They are not published: coordinate validation is outstanding, and Sydney public trial access also needs confirmation.

## Performance changes (local)

- Catalog enrichment uses per-catalog ID maps instead of repeated linear searches.
- Calculator keeps at most 10 results in component memory for 60 seconds. Returning to an unchanged profile reuses a result; nothing is stored in a public URL or shared server response cache.
- Recommendation API now exposes catalog/ranking/showrooms/total Server-Timing and private no-store headers.
- End-to-end browser latency has NOT been measured; no percentage speed improvement is claimed.

## Validation

TypeScript, targeted ESLint, chair-fit tests, SQL transaction tests and all three showroom validators passed.

## Next work

1. Representative runs 052; agent then audits the live result.
2. Agent resolves held showroom coordinates/access and continues official locator batches.
3. Agent prioritizes missing-height/depth records, with explicit variant handling before broader updates.
4. Measure actual stage transitions and API Server-Timing on desktop/mobile; investigate remaining latency and map payload size.

The representative does not need to fill spreadsheets. Research, input preparation, validation and file writing remain agent work.
