# Catalog speed and store discovery

## Changes
- Catalog cards now select only card fields from Supabase, preserving candidate-image exclusion, image ordering, publication/track filters, live prices and ratings. Existing full-query fallback retains schema compatibility.
- Brand/category counts derive from the same 236 live cards, removing duplicate catalog scans and brand descriptions from the browser payload.
- Review aggregates load independently, with pagination instead of a silent server row cap. Only aggregate counts/scores and site counters are cached for 60 seconds; review bodies and prices are not cached by this change.
- Store detail and country/city pages use on-demand static generation with 300-second revalidation. Map query variants retain their existing noindex policy. Invalid paths remain 404.
- Reuse the country-name formatter rather than constructing it throughout directory grouping.
- Add home/footer links to regional directories, links to other covered cities, visible English visit questions with source-check explanations, and CollectionPage data for the world map.
- No invented stock, opening hours, reviews, or model availability; no database mutations or Korea store additions.

## Evidence before release
- Direct live DB contract test: 236 cards match old name, brand, category, price, primary image and rating; eight products' review aggregates match. One query timing sample: old full query 1690 ms vs card query 242 ms. This is not an end-to-end page benchmark.
- Build/typecheck and lint required; existing lint warnings remain.
- Local release tests passed 48 location landing pages, 19 recently added store details, desktop/mobile country/city/map flows, sparse noindex and invalid 404 cases.
- Product search/reset and delayed navigation feedback passed.
- GSC snapshot `2026-09-16T12-59-10-496Z`: all seven inspected map/location URLs still unknown to Google; no /stores search performance rows. Sitemap had no errors/warnings, last downloaded September 15. Resubmission is separate from indexing confirmation.

## SEO/GEO approach
Readable source-backed facts, accessible page content and internal discovery follow [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features). No special AI ranking guarantee or invented AI schema. Sitemap submission uses the [official Search Console API](https://developers.google.com/webmaster-tools/v1/sitemaps/submit).

## Operational limits
Cold cache fills remain slower than warm visits. Review counters can lag for 60 seconds; directory content can lag for 300 seconds plus background regeneration. Deploying the registry creates new route output. Product prices are fetched per request. On-demand GSC inspection is not an automatic schedule.

Rollback: restore production deployment `dpl_9H17J3esgXGg4SGbqsSiWWDQc48r` (commit `25aa0cc6c0338cc0b572d363a5d42ef948bc8edc`), then revert this change in Git. No DB rollback is needed.
