# Public chair-store registry

The initial public release uses `SHOWROOMS_ENABLED=true` and `SHOWROOM_DATA_SOURCE=registry`.
`registry.json` contains only reviewed, published records: 134 Japan, 172 US, 111 Europe and 10 Africa locations (427 total across 20 countries), checked 2026-09-16. This is not a complete national inventory. Korea is excluded.

Each store and confirmed relationship has its own source URL and check date. Missing hours and trial availability remain unknown. Do not infer a model trial from a brand relationship or national product carousel. Do not copy vendor photographs without rights.

Existing published product/brand IDs are reused where exact matches exist. Store-only models retain independent directory IDs and empty product slugs; these must not produce fabricated product links. This release does not insert brands/products or modify the production database.

## Updates

Edit reviewed records in registry.json, then run:

```
node scripts/validate-world-seed.cjs content/showrooms/registry.json
node scripts/test-showrooms.cjs
npm run lint
npm run build
```

Run `node scripts/test-store-locations.cjs` for country/city boundaries, private-record exclusion, city map consistency and landing-page coverage. `/stores/locations` is the browsable directory; countries with fewer than two stores stay noindex and city pages require at least three published stores. US city URLs include state to avoid merging namesakes. Public filter URLs remain noindex. Counts and sitemap inclusion are derived from the same published store collection.

Europe/Africa source and coordinate audit: `research/europe-africa-20260916.json`. Address conflicts in Vienna/Sofia and an implausible Johannesburg map pin were held. Unresolved All Office Cape Town and Furniture Palace Mombasa Road pins were held. Address-level pins are explicitly described; unknown opening hours/model trials remain unknown. No vendor photos were copied.

Verify changed locations and map/filter behavior before releasing. Keep public text English. The application validates registry records using the same schema as database entries.

In registry mode, correction links use the existing Contact page; database management and correction-write APIs are disabled. Database mode is reserved for a later explicit migration/import. Do not run the local fixture seeder against any remote service. Migration 046 is prepared but not applied by this release.

Official sources for the additional US batch:
- https://www.humanscale.com/about/company-overview/locations.cfm
- https://www.branchfurniture.com/pages/showrooms
- https://www.branchfurniture.com/pages/location/branch-san-francisco
- https://www.sitonit.net/companylandingpage/showrooms.html

Humanscale Philadelphia was held because the official listing and map address conflict. SitOnIt Chicago is temporarily closed and excluded. Three additional records use verified street-address building pins; floor/suite and visit instructions are retained.

Europe second batch: 12 additional stores in the UK, France, Germany and Spain. Evidence: research/europe-wave2-20260916.json. Closed Back in Action branches are excluded; La Boutique du Dos Paris is held pending address reconciliation.

Europe third batch: 46 stores added from 53 candidates, including Flokk, Sedus, Interstuhl and independent chair/furniture stores. Evidence: research/europe-wave3-20260916.json. Seven conflicting/unresolved records were held; Sedus Rickenbach is not a customer showroom and was excluded. Address-only pins are explicitly labelled. Countries/cities now generate 45 indexable location pages.

Europe fourth batch: 29 verified stores (France 8, Italy 8, Spain 13). Silvera Kleber held for a postal-code discrepancy. Evidence: research/europe-wave4-20260916.json. Current indexable location pages: 47.

Index tracking: run `node scripts/track-store-indexing.cjs` with existing GSC read-only credentials. Timestamped snapshots and latest comparison are saved under data/search-growth/store-tracking. This is on-demand, not a scheduled monitor. Never commit credentials.
