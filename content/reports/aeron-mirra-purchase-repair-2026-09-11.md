# Aeron / Mirra 2 Purchase Guidance Repair

## Selection and Scope

Selected from the published-comparison audit: two affiliate events in its
rolling 30-day window, not confirmed orders or commission. No overseas search
rows were returned for comparison pages in that audit's June 11-September 8
window. This change is not a measured revenue or ranking improvement.

Updated one published row:
/compare/herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj

## Changes

- Removed unsupported fixed prices and $79 advantage, aggregated ratings,
  resale guarantees, health/comfort anecdotes and blanket user-height cutoffs.
- Removed the leaked ===BODY=== generation marker.
- Distinguished Aeron A/B/C sizes and options; Mirra 2 TriFlex/Butterfly backs,
  fixed/FlexFront seat depth, support and arm configurations.
- Added manufacturer links and two product-detail/retailer paths.
- Replaced FAQ, subtitle, excerpt and SEO metadata alongside the body.
- Preserved title, slug, product IDs, publication date, hero and unrelated fields.
  Original body image elements are retained in order if present. Retailer
  destinations and affiliate tags were not changed.

Sources checked September 11, 2026:
- https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/
- https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/

These describe current product families, not every older or refurbished listing.
The prior failed Mirra retrieval was resolved using its current official URL.
No live stock, price, checkout eligibility or seller-specific warranty confirmed.

## Verification

- Backup: scripts/backups/aeron-mirra-buying-1789091983225.json
- Product ID checks and updated_at concurrency guard passed before write.
- Returned row checked field by field against intended patch/original values.
- Offline tests: source links, image preservation, unsupported-claim removal,
  FAQ, idempotence and unexpected-media guard passed.
- Live comparison and both product pages: HTTP 200, matching canonical and
  no noindex directive. Visible revised FAQ matches FAQ schema; product links
  and sponsored Amazon tags passed. No artificial click events were sent.
- Followup dry-run: changed:false; no additional timestamp update.
- Database content only; no application deployment or build required.
- No browser visual test or physical chair test performed.

Next: inspect representative comparison URLs' GSC indexing/crawl state before
assuming more rewrites will solve the absence of reported overseas search rows.
No indexing request or scheduled monitoring was created.
