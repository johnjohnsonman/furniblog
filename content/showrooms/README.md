# Public chair-store registry

The initial public release uses `SHOWROOMS_ENABLED=true` and `SHOWROOM_DATA_SOURCE=registry`.
`registry.json` contains only reviewed, published records: 134 Japan and 172 US locations (306 total), checked 2026-09-16. This is not a complete national inventory. Korea is excluded.

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

Verify changed locations and map/filter behavior before releasing. Keep public text English. The application validates registry records using the same schema as database entries.

In registry mode, correction links use the existing Contact page; database management and correction-write APIs are disabled. Database mode is reserved for a later explicit migration/import. Do not run the local fixture seeder against any remote service. Migration 046 is prepared but not applied by this release.

Official sources for the additional US batch:
- https://www.humanscale.com/about/company-overview/locations.cfm
- https://www.branchfurniture.com/pages/showrooms
- https://www.branchfurniture.com/pages/location/branch-san-francisco
- https://www.sitonit.net/companylandingpage/showrooms.html

Humanscale Philadelphia was held because the official listing and map address conflict. SitOnIt Chicago is temporarily closed and excluded. Three additional records use verified street-address building pins; floor/suite and visit instructions are retained.
