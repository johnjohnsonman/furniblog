# Chair Fit Calculator asset manifest

## Existing assets and components to reuse

### Brand mark

- `public/chairpedia-icon.svg`
- `public/icon.svg`

These are compact app icons, not a complete horizontal wordmark. Use the existing text wordmark treatment from the live Chairpedia header for prototypes.

### Missing-photo fallback

- `public/images/chair-photo-unavailable.svg`
- Existing implementation: `components/chairs/ChairProductImage.tsx`

Do not create empty image blocks or enlarge low-resolution chair photos.

### Existing chair UI references

- `components/chairs/ChairProductImage.tsx`
- `components/chairs/ChairProductSpecs.tsx`
- `components/chairs/ChairScoreRadar.tsx`
- `components/chairs/ProductImageGallery.tsx`

These are functional references. Claude Design may redesign their presentation for the calculator.

### Existing showroom UI references

- `components/showrooms/AtlasMap.tsx`
- `components/showrooms/ShowroomFinder.tsx`
- `components/showrooms/StoreDetails.tsx`
- `components/showrooms/atlas.css`

The calculator should reuse the showroom data model and map behavior, while presenting a more focused shortlist experience.

### Existing explanatory diagrams

- `public/images/blog/aeron-fit-check.svg`
- `public/images/blog/aeron-fit-check.png`
- `public/images/blog/chair-condition-checklist.svg`
- `public/images/blog/contessa-configuration.svg`
- `public/images/blog/leap-gesture-controls.svg`

These provide tone and information-design references. They should not be pasted directly into the calculator.

## New design assets required

### 1. Responsive Body–Chair–Desk fitting model

Deliver as layered SVG or code-ready vectors with separately addressable parts:

- Body silhouette
- Chair back
- Seat pan
- Armrests
- Chair base
- Desk surface
- Floor line
- Seat-height measurement
- Seat-depth measurement
- Armrest-clearance measurement
- Suggested-range band
- Conflict band
- Anchor points and labels

The parts must support changes in height, posture, seat range, desk height, and recline. Do not deliver this only as a flattened PNG.

### 2. Fit range visualization

Reusable component for comparing:

- User suggested range
- Product adjustment range
- Overlap
- Conflict
- Unknown measurement

Provide horizontal and compact mobile versions.

### 3. Fit Passport

Provide two forms:

- Responsive in-product card
- Privacy-safe share image template, ideally 1200 × 630 and 1080 × 1350

The share version must omit weight, pain selections, precise location, and other private inputs.

### 4. Fit-state icon family

- Good fit
- Conditional fit
- Insufficient data
- Verified measurement
- Missing measurement
- Confirmed to try
- Brand carried — ask first

Use simple code-ready SVG icons. Do not rely on color alone.

### 5. Showroom transition assets

- Chair-to-map-marker transformation states
- Exact-model marker
- Brand-level marker
- Cluster marker
- Mobile bottom-sheet handle and map/list controls

The existing map tiles and map engine remain in use. Do not create a decorative fake map as the production solution.

### 6. Material swatches

- Mesh
- Fabric
- Leather
- No preference

Prefer lightweight CSS/SVG texture treatments. Raster textures are optional and should remain subtle.

### 7. Measurement guide

A short visual sequence showing how to measure:

- Floor to desk surface
- Current chair seat height
- Seat depth
- Armrest clearance

Deliver as reusable SVG frames, not video.

### 8. Empty-state illustrations

- No confident match
- No nearby showroom
- Missing measurements
- Location permission denied

Keep these diagrammatic and editorial. They should not look cartoonish.

## Product photography

Do not invent or generate fake product photos for real chair models. Production cards must use the catalog's licensed or approved product images and the existing fallback when unavailable.

Claude Design can use neutral placeholder chair silhouettes in wireframes. High-fidelity screens should reference real catalog imagery only when the source is already approved in the product.

## File delivery format

Request:

- Editable design source or shareable design project
- SVG exports for all vector assets
- PNG previews for review only
- Component names and variants
- Desktop, tablet, and mobile constraints
- Motion timing and easing values
- Color and typography tokens
- Light/dark usage rules if both are used
- Reduced-motion variants

