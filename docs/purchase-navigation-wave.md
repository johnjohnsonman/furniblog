# Purchase navigation wave, 2026-09-14

Offline customer experience dates are hidden on the collection, chairpark review cards and detail pages (including their datePublished). Original database dates remain available for sorting and audit. This supersedes the date-display decision in chairpedia-brand-search.md. No database writes were needed.

Baseline: 2026-08-15 through 2026-09-11, 28 days. Historical GSC and GA4 page data plus 18 database affiliate clicks. These are separate aggregates, not a joined conversion funnel or commission report. The selected English pages had zero GSC clicks/impressions in that period; selection is primarily based on GA4 engagement. New-domain search performance is not established.

Priority pages (sessions / engaged sessions):
- Aeron guide: 33 / 16
- Leap V2 guide: 38 / 15
- Doro C300 guide: 38 / 12
- Libernovo lineup explained: 14 / 8
- Gesture guide: 29 / 7
- Aeron size guide: 10 / 7
- ErgoChair Pro guide: 13 / 6
- Contessa II guide: 12 / 6
- Libernovo complete lineup guide: 21 / 5
- Freedom vs Contessa II comparison: 7 / 5

Rank candidates by engaged sessions * 3 + GSC clicks * 5 + log(1 + impressions) + affiliate clicks * 2, excluding a Pinterest reference article with unrelated buying intent. Audit exact URLs and status before deploying. Both Libernovo URLs are existing independent pages; no URL consolidation in this change.

Shared decision cards separate chair-selection checks from current seller offers, link to relevant model/size guides and suppress self-links. C300 now has a decision card; comparison top buy rows add model checks and guide links. Existing photos, affiliate destinations/tags and event handlers are retained. This is navigation improvement, not a full rewrite of ten articles or a claim of measured uplift.

Validation: TypeScript, lint, domain migration, SEO quality, 72 affiliate routing cases, rendered date/self-link regression tests, and production representative visual/HTTP checks. Deployment results are recorded in the workspace audit report.

Rollback: restore the preceding production deployment dpl_9E1kLikmcETzTHzLL65eUWRwxBrw. No database restore is required. Keep canonical and domain redirects unchanged.
