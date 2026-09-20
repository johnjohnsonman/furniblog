# Chairpedia — Authority and Interaction Upgrade Brief

## Position

Chairpedia should feel like the definitive independent reference for office chairs: a living field guide that combines published specifications, editorial interpretation, fit methodology, comparisons, and verified places to try chairs.

The reference point is the authority and navigability of an encyclopedia, expressed through a more refined furniture-editorial interface. It must not imitate Wikipedia's visual styling literally. Authority comes from transparent evidence, consistent taxonomy, revision history, and useful tools.

ChairMan and ChairBot are reserved for ChairPark and do not appear on Chairpedia.

## Core promise

Every consequential claim should answer four questions:

1. What is known?
2. Where did it come from?
3. When was it checked?
4. What remains unknown or subjective?

Chairpedia should never make a recommendation look more certain than its evidence.

## Visual system

- Warm paper background, ink black, mineral blue, muted green for verified records, restrained amber for conditions or unresolved data
- Editorial serif for page titles and section openings; neutral sans serif for specifications, controls, tables, and citations
- Fine rules, stable grids, numbered figures, footnotes, marginal notes, and compact evidence labels
- Real licensed product photography and technical diagrams; a designed neutral silhouette where imagery is unavailable
- No mascots, glossy 3D decoration, neon scanning effects, floating particles, glass cards, or large gradient fields
- Use space to establish hierarchy, but avoid the current opening screen's excessive empty area. Keep the primary action and evidence within the first viewport

## Information architecture

### Chair dossier

Each chair receives a stable canonical page containing:

- Identity: manufacturer, model, generation, release period, status, variants
- Published dimensions with unit conversion and source-level citations
- Adjustment inventory with definitions and known range limits
- Materials, warranty, certifications, repairability, replacement parts, and regional availability
- Editorial assessment separated clearly from manufacturer claims
- Known unknowns and conflicting source values
- Comparable models and lineage
- Verified exact-model showrooms and brand-carried locations
- Last reviewed date, contributors, corrections, and revision history

### Knowledge pages

Build reusable reference pages for seat height, seat depth, lumbar systems, recline mechanisms, armrests, mesh, foam, standards, measurement methods, and fit terminology. Product pages link to these definitions instead of repeating shallow explanations.

### Comparison

Comparison begins with user-relevant dimensions and evidence confidence. Unknown values remain explicit. Every differing claim links back to its source or methodology note.

### Showrooms

Exact-model verification and brand-level availability remain separate. Display the verification date, verification method, visit requirements, and a clear confirm-before-visiting state.

## Calculator opening upgrade

Replace the static hero with a compact interactive measurement plate.

- Left: title, one-sentence promise, primary action, known-chair path, and evidence strip
- Right: side-elevation body/chair/desk diagram with seat-height, seat-depth, and desk-clearance layers
- On pointer focus or keyboard focus, one measurement layer activates and its definition appears in a margin note
- On start, the diagram becomes the persistent fitting model through a shared-element transition
- Directly below the first viewport, show methodology, sources, and data limitations as concise linked summaries rather than a large wall of prose

## Calculator interaction upgrades

### 1. Live cause and effect

Every input updates one named measurement, one diagram layer, and one plain-language statement. For example, changing desk height moves the clearance line and changes “Armrests may not tuck under this desk” immediately.

### 2. Evidence rail

Keep one persistent range graphic in results. Hovering, focusing, or swiping a chair updates the same rail with:

- User suggested range
- Chair published range
- Overlap or conflict
- Missing fields
- Source and last-checked date

### 3. Source drawer

Every specification and fit claim opens a compact provenance drawer showing the source title, source type, publication or access date, applicable region or model generation, and any normalization Chairpedia performed.

### 4. Shared-element result reveal

The abstract fitting chair resolves into the first real product photograph while the user's measurement bands stay fixed. The transition should explain that the same ranges are now being applied to a real chair.

### 5. Constraint recovery

When no result qualifies, identify the single blocking constraint and preview how many chairs return if it is relaxed. Keep the fit passport visible.

### 6. Showroom handoff

The chosen chair footprint becomes a map marker, then separates into “confirmed exact model” and “brand carried” locations. The store list remains fully usable without the map.

### 7. Fit passport

Create a downloadable and locally saved reference card containing suggested ranges, desk-clearance requirement, priorities, method version, market, and review date. Do not put body measurements in readable public URL parameters.

### 8. Real progress

Resolve analysis stages from actual completed calculations. If calculation is immediate, reveal results immediately. Do not use fake scans or fixed waiting animations.

## Authority features

- Claim-level citations rather than one generic source list
- Source hierarchy labels: manufacturer specification, certification database, retailer listing, editorial measurement, reader report
- Visible last-checked dates on volatile data such as price, availability, warranty, and showroom status
- Revision history for specifications and methodology
- Contributor and reviewer identity pages with editorial standards
- Public corrections flow tied to the exact claim or field
- Conflicting-value treatment that shows both values and explains Chairpedia's selected canonical value
- Methodology version attached to every fit result
- Stable glossary anchors and canonical URLs for definitions

## SEO and generative-search structure

- One canonical entity page per chair model and generation
- Descriptive title, concise answer-first summary, table of contents, stable section anchors, and meaningful internal links
- Product, Article, BreadcrumbList, FAQPage where eligible, Organization, and Place structured data based only on visible verified content
- Machine-readable specifications must match the visible table exactly
- Cite primary manufacturer or standards sources near each factual claim
- Separate regional price and availability from stable product facts
- Connect product, brand, comparison, mechanism, material, and showroom pages as a knowledge graph
- Generate sitemaps by content type and update frequency
- Avoid mass-producing thin location, comparison, or question pages without unique verified information
- Treat `llms.txt` as optional discovery metadata, not as a substitute for crawlable pages, structured data, citations, or internal linking

## Motion language

- Input response: 120–180 ms
- Page and shared-element transitions: 220–320 ms
- Showroom map expansion: 360–450 ms
- Animate line drawing, range changes, masks, opacity, and transforms
- Use motion only to reveal measurement, provenance, comparison, or movement from chair to place
- Remove cursor-following parallax
- No continuous loops or artificial analysis delays
- Provide equivalent static states under `prefers-reduced-motion`

## Current HTML changes in priority order

1. Remove pointer parallax and any decorative motion unrelated to evidence
2. Reduce opening-page empty height and bring methodology/source links closer to the primary action
3. Turn the opening side-elevation drawing into an interactive measurement plate
4. Make analysis stages reflect real individual completion rather than resolving together
5. Add source and last-checked metadata to result evidence rows
6. Add the persistent evidence rail across result cards
7. Replace generic page changes with the fitting-model-to-product shared-element reveal
8. Strengthen the chair-to-showroom map transition and verification hierarchy
9. Add fit-passport export and private local return state
10. Connect candidate counts to the production Chairpedia catalog and show fit-ready coverage separately from total catalog coverage

## Acceptance standard

The experience is ready when a first-time visitor can identify the evidence behind a recommendation, distinguish fact from editorial judgment, understand missing data, compare chairs against the same personal ranges, and move from a product conclusion to a verified place to try it without encountering a mascot, unexplained score, or unverifiable claim.
