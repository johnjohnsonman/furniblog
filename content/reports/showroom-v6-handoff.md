# Chairpedia Showroom Finder V6 — implementation handoff

## Status and isolation

Update 2026-09-16: the user subsequently authorized public deployment. The public release uses the version-controlled registry documented in `content/showrooms/README.md`; the database migration remains unapplied. The original approval notes below describe the earlier local-only handoff and are historical.
Implementation branch: `feature/showroom-finder-v6`, based on production `0fd0f6ed180afddc7beaef5951eb60e464577ac0`.
The IDE root checkout is older (`faa7cae`) and contains unrelated uncommitted work; it has not been reset, cleaned or merged into this implementation.
Working checkout: `C:/Users/Public/Documents/ESTsoft/CreatorTemp/chairpedia-migration-20260914`.
No production migration, real-store import, push or deployment is authorized in this batch. None performed.

Design reference found at `C:/Users/p/Downloads/Chairpedia Showroom Finder v6 - Editorial Atlas - standalone.htm`. It is a bundled prototype containing templates, React runtime and sample data. The implementation uses native Next/React components, not an iframe or injected standalone bundle. Prototype device switch, clock, sample businesses and obsolete camera counter are not shipped in the public route.

## Existing integration
Next.js 16.2.6 / React, npm lockfile, Supabase. Existing `brands.id` and `products.id` UUIDs are used, with products referencing brands. Existing admin cookie/header authentication and admin panel layout are reused. Existing server image upload storage is reused by the admin form. No new accounts/authentication system or storage bucket.
No existing store catalog is present in repository schema; read-only production REST discovery returned PGRST205 for `stores` and `showrooms`. The existing experience-review store text field is not a verified store database and is not converted into listings.

## Routes and components
- `/stores`: map/list, search over registered names/cities/countries, brand/model/confirmed-trial/appointment/type filters, area search, world and fit actions.
- `/stores/{slug}`: server-rendered store details, contact links, model links; only published rows are accessible.
- `/admin/showrooms`: existing protected admin panel; create/edit, draft/published/private, relations, hours, evidence, optional photos, correction review.
- `/api/admin/showrooms` and `/api/admin/showrooms/corrections`: existing requireAdmin guard; no public writes.
- `/api/showrooms/corrections`: pending private reports only, same-origin and payload checks. Does not modify store facts.
- `components/showrooms/*`: V6 editorial layout, MapLibre lifecycle, mobile sheet, details and admin editor.
- `lib/showrooms/*`: domain types, validation, timezone/overnight/exception hours, dateline-aware geometry and public repository.
- Product pages gain a model-prefiltered link only when enabled. Sitemap adds only published store URLs; arbitrary filter queries are noindex with `/stores` canonical.

## Feature switch
`SHOWROOMS_ENABLED=true` enables routes, APIs and product links. Leave unset/false until the migration is approved and applied. `/stores` returns 404 when disabled; admin page explains disabled state. Do not expose test fixtures in production.

## Database migration
Prepared `lib/supabase/migrations/046_showroom_finder.sql` creates `showrooms`, `showroom_brands`, `showroom_models`, `showroom_corrections`, published-only read policies, service-only writes and atomic `save_showroom` RPC with optimistic concurrency.
Official-dealer evidence belongs to each store/brand relationship. Trial evidence belongs to each exact store/model relationship. Unknown / unavailable / confirmed are distinct. Stock is not represented.
Correction messages and requester emails are stored in a separate table with no anonymous or authenticated read grant. They are never returned in public store data.
Mandatory publication: name, unique slug, country code, city, street address, coordinates, source and verification date. Phone, email, hours, timezone and photos may remain unknown. No timezone means no open-now claim.
Hours JSON: weekly `0` Sunday through `6` Saturday; `null`/omitted unknown, `[]` closed, arrays of `{open:"HH:mm",close:"HH:mm"}` for intervals/breaks. Close <= open means next-day close; equal means a 24-hour interval. Date exceptions override that calendar day, including previous-day carry. Admin editor currently edits this structured JSON with guidance rather than a calendar widget.

## Provider choice
MapLibre GL JS (BSD-3-Clause) with OpenFreeMap Positron, as in V6. No Mapbox migration, key, paid account or billing activation.
OpenFreeMap's official page permits commercial usage and says the public instance has no request/view limits or registration. It offers no SLA. Built-in attribution remains visible (OpenFreeMap / OpenMapTiles / OpenStreetMap). API/library and data-provider terms are separate.
Sources checked 2026-09-15:
- https://openfreemap.org/ (usage, commercial use, attribution, no SLA)
- https://github.com/maplibre/maplibre-gl-js (library license)
No automatic OSM raster fallback: switching public infrastructure is not necessary for core task completion. On load failure, keep list/filter/detail functional and offer retry. Every map creation/retry owns one ResizeObserver; cleanup disconnects it. Resize is scheduled only for changed dimensions. No unused camSeq.

MapLibre 6.9.1 requires a separate worker and shared module under Next/Turbopack. `scripts/copy-maplibre-worker.cjs` copies both files and the license from the pinned package to ignored `public/maplibre/`. The `predev`/`prebuild` npm hooks generate them; use `npm run dev` / `npm run build`, not bare `next build`. The map calls `setWorkerUrl` with this same-origin worker. Source: https://maplibre.org/maplibre-gl-js/docs/ (Next.js integration). Real OpenFreeMap tiles loaded successfully after this fix. Place-label layers use `name:en` rather than the provider's bilingual default; English names absent in the tiles are omitted.

## Local review setup (no remote database)
1. In the implementation checkout: `npm ci`.
2. `node scripts/showroom-test-db.cjs` starts an ephemeral PostgreSQL-in-WASM adapter on `127.0.0.1:4317`. Fixtures are explicitly marked and are never loaded by production application code.
3. In another PowerShell session set `SHOWROOM_LOCAL_REVIEW=true`, `SHOWROOMS_ENABLED=true`, `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:4317`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-only`, `SUPABASE_SERVICE_ROLE_KEY=local-service-only`, `ADMIN_SECRET=local-showroom-test-only`, then `npm run dev -- --port 3107`.
4. Open `http://localhost:3107/stores` or `/admin/showrooms`. The password above is a local fixture password only. Never configure it on production.
5. The local adapter implements only the subset of REST required for this review; it is not a replacement Supabase service and is not deployed. The existing upload path is reused but the adapter has no storage service: actual upload is not integration-tested here.

## Initial real-store input checklist
For each Chairpark branch or other verified candidate obtain current official name, branch-specific address/floor, coordinates, country/city, official source URL and check date. Separately confirm timezone, weekly/special hours, public contacts, appointment policy, parking/accessibility notes and licensed photos.
For every brand confirm carried status and any official-dealer claim from a current source. For each exact chair model confirm whether it is actually available for trial; do not infer it from the brand or historical customer reviews. Missing values remain unknown. No real-store candidates are published in this batch.

## Transition and rollback (approval required)
1. Review this branch, screenshots, schema and verification limitations. Reconfirm current production SHA before merge.
2. Back up schema/grants and any pre-existing tables with these names; abort on unexpected existing schema. Confirm foreign-key types and migration number remain available. Review API abuse controls for anonymous reports before broad promotion.
3. With approval apply migration in one transaction; verify grants/RLS/RPC on staging first and production second. Keep feature disabled.
4. With separate approval enter verified real stores as drafts, check relations and contact URLs, then publish intended rows.
5. With deployment approval deploy matching code with feature disabled; enable only after the database and content pass checks. Validate store routes, filters, contacts, sitemap and existing homepage.
6. Roll back code/disable `SHOWROOMS_ENABLED` first if needed. Preserve store data and reports for diagnosis; do not drop tables as routine rollback. A failed migration transaction rolls back. If schema removal is explicitly desired later, export data and drop RPC/relations before the parent table in a separate approved maintenance operation.

## Measurements and limitations
`showroom_action` emits detail_open/directions/phone/email/website/booking with store ID only, via existing gtag if available. It is gated to production on www.chairpedia.com; no visitor precise location or requester contact enters events. These are clicks/detail views, never visits/calls/bookings completed. Existing GA outbound-click events are separate; do not sum them as duplicate conversions.
Real device tests, production Supabase integration, live storage upload and GA receiving events require later validation; no claim of completion for those checks.

## Completed verification (2026-09-15)
- `node scripts/test-showrooms.cjs`: passed against ephemeral PGlite PostgreSQL, including the actual migration, role grants/RLS, private parent relations, optimistic concurrency and atomic rollback. Also timezone, overnight/break/exception hours, invalid dates/phones, geographic wrapping, model filter semantics and contact URL validation.
- `npm run build`: compiled, typechecked and generated 93 static pages using the isolated local database and separate build cache; store routes remain dynamic. Subsequent English-label and input-validation edits passed standalone TypeScript and relevant unit checks.
- `npm run lint`: zero errors; 15 pre-existing warnings outside this feature.
- Edge/Playwright at 1440×900, 1024×768, 360×740, 393×852: list/filter/detail, no horizontal body overflow, contact targets, empty filtered results and keyboard sheet controls passed.
- Browser admin workflow: anonymous denial, draft create, incomplete publication rejection, publish, unpublish/private URL denial passed.
- Actual provider map: loaded tiles/attribution, hover/selection without camera reset, overlapping-store picker, collapse/expand resize, drag/area search passed.
- Forced provider failure followed by successful real-provider retry: synthetic CDP touch moved mobile sheet through peek/half/full; canvas matched container sizes and closing detail restored the previous sheet. These are synthetic touches, not physical handset tests.
- Correction request API: pending submission, anonymous admin denial, authenticated private review/resolve, no requester email in public detail passed. Submission was exercised through HTTP; the form UI received visual/code review.
- Model-prefiltered entry, filter canonical/noindex, server HTML detail/contact/model links and published-only sitemap passed. The existing complete product page against production Supabase was not end-to-end tested; its gated link was code-reviewed and compiled.
- Actual zero-published-store state passed in the browser after temporarily making the isolated fixture rows private through the real save RPC; original fixture statuses were restored in a finally block. No dummy stores are inserted to hide the empty state.

Artifacts and browser scripts are in the preserved IDE checkout:
`C:/Users/p/Desktop/park/furniblog/data/showroom-review/` and `scripts/test-showroom-{browser,map,links,empty}.cjs`.
The browser scripts use that checkout's existing Playwright installation and Edge. The CRUD browser test expects a freshly started ephemeral database (its slug is fixed); restart the test adapter before rerunning the full CRUD suite. These scripts target localhost:3107 / 127.0.0.1:4317 only.

No branch commit or push is included in this handoff; changes are on `feature/showroom-finder-v6`. Next's generated `next-env.d.ts` already had local changes before this task and must not be swept into a later feature commit without reviewing them. Other processes' build caches and the older IDE worktree were preserved.

## Decisions before launch
1. Review the native V6 adaptation at localhost:3107/stores (all visible test businesses are fictitious and isolated).
2. Supply/approve the first real stores' current evidence and licensed photos; no invented addresses, trial models or opening hours.
3. Approve production migration and deployment separately after staging Supabase/storage verification. Public-instance map service requires no paid account; existing Vercel/Supabase usage still applies. A paid map SLA is not purchased.
4. Minimum correction submission is implemented. It has origin, payload and honeypot checks, but no dedicated rate limiter/CAPTCHA; assess abuse protection before broad promotion. This does not alter store facts automatically.
