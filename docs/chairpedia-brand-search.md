# Chairpedia brand search and review provenance — 2026-09-14

Scope: preserve migration routes and homepage finder; improve brand identity and navigation without rewriting the catalog.

- Visible Korean alias on home/footer/about; homepage title includes Chairpedia and Korean name.
- WebSite and Organization have stable IDs, alternate names, descriptions, and publisher links.
- Homepage provides direct crawlable product/comparison/guide/review/editorial/about links; footer adds missing comparison and guide entry points.
- Remove unsupported daily-update and database-superlative defaults. About hero states the subject instead of a world-record claim.
- Experience cards retain original created_at and call it Recorded, with a clear explanation. No visit date or fresh retest is invented, and no DB dates are changed.
- Read-only review_sessions audit: approved 592, pending 0, rejected 0; latest approved created_at 2026-06-30T06:22:17.823881+00:00. This is not proof that offline customers stopped providing feedback. The import script does not preserve a verified visit date; new source records would be needed to investigate missing offline imports.

Validation: TypeScript and ESLint (0 errors, 15 pre-existing warnings); domain-migration, seo-quality and SmartBuyLink tests pass. Deployment and live verification recorded in local release report.

Prior account work confirmed by user screenshots: both Furniblog hosts' GSC change-of-address requests submitted; Chairpedia sitemap success (2747 URLs); GA stream updated with existing measurement ID; US/SG/JP Associates website lists updated. Coupang evidence upload deferred by user.

No ranking or AI citation guarantee. Google AI features use foundational SEO; no special AI schema or llms.txt was added. Monitor brand query impressions/clicks and indexing after migration. Do not change review timestamps to simulate freshness.

Sources:
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/blog/2019/03/help-google-search-know-best-date-for
