# Contessa II Purchase Path Repair

## Decision

Used the September 10 GSC baseline (June 10-September 7, outside Korea), not
new performance data: Contessa guide had 9 impressions and no clicks. This
small sample identifies an existing discovery path, not a proven revenue winner.
ingCloud's recently repaired links were left unchanged.

The Contessa guide lacked a direct comparison link. Its existing published
Aeron comparison contained unsupported fixed prices, a $519 price advantage,
height-based fit ranges, aggregate ratings, medical/comfort anecdotes and a
claim that Contessa headrests are standard. It was unsuitable for promotion
without correction. No additional mass linking was added to unreviewed articles.

## Live Changes

- Replaced one comparison's body, FAQ, subtitle, excerpt and SEO metadata with
  research-based configuration and purchase checks. Preserved its URL, title,
  product mapping, publication date, hero and other unrelated fields.
- Removed unsupported price, rating, resale and warranty winners, medical
  anecdotes and universal height recommendations.
- Distinguished optional headrests, upholstery, arm and back-support choices.
- Linked manufacturer sources and the existing Aeron product/retailer page.
- Appended one contextual link to the Contessa guide; its original body,
  answer introduction, images and metadata were preserved.
- Existing sponsored retailer links and affiliate tags remain. Marketplace
  results are not represented as verified inventory or commission eligibility.

Comparison: /compare/okamura-contessa-ii-vs-herman-miller-aeron-which-should-you-buy-ms5i1068

Guide: /chairpedia/okamura-contessa-ii-contessa-seconda

Backup: scripts/backups/contessa-aeron-buying-1789088625865.json

## Verification

- Offline tests: evidence copy, sources, image preservation, append-only guide
  link, FAQ, idempotence and unexpected-media guard passed.
- Both published rows and product mappings checked before writing; backup
  created before changes; updated_at concurrency checks applied to each write.
- Every returned database field compared against its original or intended patch.
- Live guide, comparison and Aeron product: HTTP 200, matching canonical and
  no noindex directive. Guide link, answer introduction, revised comparison,
  visible FAQ/FAQ schema and tagged sponsored links passed.
- Followup dry-run reports no changes for either row. No artificial affiliate
  click events were sent. No stock, checkout or browser visual test performed.
- Database content update only; no application build or Vercel deployment needed.

## Next

Inspect the next already-published comparison before giving it more incoming
links. Keep any old numeric fit, price and reviewer-derived claims outside the
promotion path until reviewed. Measure later search/click/order outcomes
separately; no ranking uplift, scheduled monitoring or indexing request claimed.

Official sources checked September 11, 2026:
- https://www.okamura.com/products/contessa-ii/
- https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/
