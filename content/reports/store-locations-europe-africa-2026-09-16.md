# Store location discovery and Europe/Africa expansion

- 34 additional published locations: 24 Europe, 4 South Africa, 6 Kenya.
- Total: 340 stores, 16 countries. Existing 306 records retained; Korea excluded.
- `/stores/locations` provides server-rendered, browsable country/city listings with real addresses, source dates, visit conditions and direct store/official-site links.
- 33 indexable directory pages: index + 10 country pages + 22 cities. Six one-store country pages remain noindex; cities need at least three stores. Unknown paths return 404. Filter URLs remain noindex.
- Unique title/description/canonical/social metadata; CollectionPage, ItemList and BreadcrumbList match visible content. Sitemap and page counts derive from the same published collection.
- City map links prefilter country and exact city, including US state to separate namesake cities. Map navigation links back to the directory; store details link to their country.
- No ranking/indexing completion claims. No invented stock, reviews or model-trial confirmation; no unlicensed photographs.

## Evidence and validation

Official sources and map-coordinate evidence are in `content/showrooms/research/europe-africa-20260916.json`. Vienna/Sofia address conflicts, an implausible Formfunc Johannesburg map pin, and unresolved All Office Cape Town/Furniture Palace Mombasa Road pins were held.

Passed store schema, timezone, holiday, RLS and filter tests; location tests cover private-record exclusion, city boundaries and all map/list counts. Lint has no errors (15 pre-existing warnings). Production build passes. Local browser tests cover all 33 indexable location URLs, all 34 new details, sparse noindex/invalid 404, English text, London and Nairobi navigation, country resets, and desktop/mobile overflow. Screenshots inspected at 1440 and 393 widths.

Registry mode remains active; no production database mutations or new credentials. The last production deployment before this release is `dpl_DsW3P8SEk2kxAwAockgjAXg9RGPm`; rollback using `vercel rollback dpl_DsW3P8SEk2kxAwAockgjAXg9RGPm` if required. No DB restoration is needed.

Next: monitor Search Console coverage/impressions for the new directory; expand independently operated chair retailers and investigate held addresses before publishing them. Search results and complete continental coverage are not guaranteed by this release.
