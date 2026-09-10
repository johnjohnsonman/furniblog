# Overseas Search Opportunity: ingCloud

## Selection

Read-only GSC query, finalized web data, June 10 to September 7, 2026,
country filter excluding Korea. These are historical baselines, not results
of today's edits. Query rows omit anonymized searches.

| Candidate | Overseas impressions | Clicks | Average position |
| --- | ---: | ---: | ---: |
| KOKUYO ingCloud | 57 | 3 | 8.70 |
| Herman Miller Aeron guide | 14 | 0 | 81.64 |
| Okamura Contessa II | 9 | 0 | 19.89 |
| Steelcase Leap V2 | 6 | 0 | 51.17 |

ingCloud is the strongest acquisition candidate among these four, not a proven
highest-revenue page. The larger all-country Leap total was not a reliable proxy
for overseas opportunity. We have not verified an ingCloud-specific US affiliate
listing. Monetization is therefore indirect and unproven: useful buying guidance
and relevant links to existing comparison pages, without pretending other chairs
are equivalent substitutes or that a generic Amazon search confirms stock.

Evidence file: data/gsc/candidate-guides-1789030540717.json.
GSC inspection: Submitted and indexed, matching canonical, last crawl August 22,
2026 at 01:30:36 UTC. This crawl predates the edits; no ranking uplift is claimed.

## Changes

- Updated only the published ingCloud database row's content_html, gen_sources
  and updated_at. Preserved title, SEO metadata, slug, product mapping, publication
  date, existing answer introduction and all 20 body images in the same order.
- Replaced 16 legacy sections with model-specific buying checks and evidence.
- Corrected the claim that ingCloud had no GREENGUARD documentation. The linked
  certificate's date and scope are described without claiming a live UL check.
- Removed unverified 4D-arm terminology, pressure percentages, universal fit
  ranges, comfort/durability anecdotes and overseas shipping-price estimates.
- Explained the documented no-retrofit headrest restriction and distinguished
  seat-gliding control from an assumed conventional recline lock.
- Linked the official Japanese sales channel with explicit stock/shipping
  limitations. Kept existing Amazon search links labeled as searches.
- Added contextual links to the existing Contessa guide and M18/C300 comparison.
- Reduced gen_sources to the five official sources actually supporting the page.
  No unrelated news, review, product or comparison database rows were changed.

Backup: scripts/backups/ingcloud-buying-evidence-1789030911222.json.

## Verification

- Offline test: section matching, media preservation, idempotence, source links,
  buying caveats and failure on unexpected content: PASS.
- Database dry-run: 16 sections, 20 images, 5 sources: PASS.
- Post-write comparison of every database field: PASS.
- Live audit: HTTP 200, self-canonical, indexable, 16 revised sections, exact 20
  image URLs/order, five sources, two tagged Amazon links, two new internal links
  resolving to HTTP 200: PASS.
- Existing ingCloud and Contessa metadata/schema/internal-link regression: PASS.
- No browser screenshot or physical chair testing was performed. PDF screenshot
  retrieval failed; numerical drawing interpretation was not added. Claims use
  the official documents' extracted text, with links to the underlying sources.
- No app component or styling changed; a new application build was not required.

## Next

Wait for a post-edit Google crawl before judging search effects. Compare overseas
page/query performance with the baseline and affiliate clicks with commissions
separately. No scheduled monitoring or indexing request has been created.

An unrelated, previously undeployed Leap rich-data file contains a factory-headrest
claim contradicted by Steelcase's official page. Do not include that pending batch
in production without a separate evidence review. It was not deployed here.

Sources:
- https://www.kokuyo.com/en/furniture/seating/task/ing-cloud/
- https://www.kokuyo.com/en/insights/20260610/
- https://www.kokuyo.com/sites/default/files/shared_contents/furniture/en/seating/task/ingcloud/files/ingCloud.pdf
- https://www.kokuyo.com/sites/default/files/shared_contents/furniture/en/seating/task/ingcloud/files/GREENGUARDCertification_ingCloud.pdf
- https://www.kokuyo.com/news/release/20251203fn/
