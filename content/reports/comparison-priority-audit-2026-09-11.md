# Published Comparison Priority Audit

## Scope and Results

Read-only audit of all 120 published comparison rows, including body, FAQ,
subtitle, excerpt and SEO fields. Database reads are paginated; no public
content, status, affiliate destination or publication date was changed.

GSC: finalized web data, June 11-September 8, 2026, excluding Korea. The
/compare/ page-filter query returned no rows. This is not evidence of zero
market demand, a manual penalty or failure of recent edits.

Affiliate events: rolling 30 days ending at the report's generatedAt timestamp.
17 site events; 4 mapped to comparison-page referrers. These are events, not
unique people, orders or commissions. Historical country data is unreliable,
so these events are not represented as an overseas-only cohort. Do not divide
them by the differently scoped GSC counts to calculate conversion.

| Review signal | Pages |
| --- | ---: |
| Any automated flag | 118 |
| No external links in authored body | 116 |
| Price figures | 116 |
| Rating language | 115 |
| Numeric dimension or weight | 118 |
| Numeric warranty duration | 109 |
| Selected winner/value phrases | 43 |
| Selected health claims | 24 |
| Selected absolute option claims | 14 |

Signals are candidates, not confirmed errors. Source absence refers to authored
body links, not every rendered component. Keyword rules have false positives
and false negatives; zero flags is not a certification of quality. Recently
corrected Leap/Karman is flagged for its documented weight and needs no repeat
rewrite on that basis.

## Editorial Order

1. Aeron vs Mirra 2: 2 affiliate events, no reported overseas search rows.
   First uncorrected revenue-path candidate. Manual reading found a $79 fixed
   price comparison, unsupported aggregated 3.5/4.3 scores, a blanket Aeron
   height ceiling, health/comfort anecdotes and a leaked ===BODY=== marker.
   Official Aeron documentation distinguishes sizes and configurations; the
   current body collapses these into one table and an inadequately supported
   tall-user recommendation. Review both models' specifications before repair.
2. Leap V2 vs Karman: also 2 events, but already repaired and source-linked.
   Do not rewrite merely because the automated detector sees a numeric weight.
3. Next evidence-review queue: Embody vs Freedom; Embody vs Contessa II;
   Diffrient World vs Gesture; Contessa II vs Mirra 2. Each has eight signal
   categories but no measured comparison clicks or overseas search rows in
   these windows. Ties are deterministic slug order, not a claimed ROI ranking.

No mass deletion/noindex decision is justified by regex flags alone. Start
with the clicked Aeron/Mirra comparison, then individually verify severe claims
in the remaining queue. Existing sitewide content quality issues are not a
proven diagnosis of why Google has not returned comparison performance rows.

## Evidence and Verification

- data/gsc/comparison-pages-latest.json
- data/seo-audit/comparison-priority-1789090904794.json
- scripts/test-comparison-priority.cjs passed: candidate detection, script
  exclusion, same-site referrer parsing and explicit priority ordering.
- Official Aeron source opened successfully:
  https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/
- The attempted legacy Mirra 2 product-details URL returned a retrieval error.
  Its specifications have not yet been verified in this audit.

The new GSC mode uses the existing readonly scope. No indexing requests,
scheduled monitoring, AI calls, purchase clicks or public writes were made.
