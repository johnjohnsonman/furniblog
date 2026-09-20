# Chairpedia Fit Results — Ranking and Design Brief

## Purpose

Design a recommendation result that helps a person choose among several defensible options without pretending that chair comfort can be predicted as an exact probability.

The page should answer:

1. Which chairs satisfy the user’s measurable fit constraints?
2. Why does each highlighted chair deserve a distinct role?
3. Which published values support the recommendation?
4. Which values are missing, conditional, or configuration-dependent?
5. Where can the exact model be tried?

ChairMan and ChairBot do not appear anywhere in this experience.

## Score language

Use **Fit Score 86/100**, not “86% compatible,” “86% match,” or “86% likely to fit.”

Fit Score is an explainable index based on the user’s entered requirements and Chairpedia’s available product data. It is not a probability, medical assessment, comfort guarantee, or population percentile.

Always pair the number with:

- `Good`, `Conditional`, or `Incomplete data`
- confidence level: `High`, `Medium`, or `Limited`
- score-component breakdown
- at least one positive reason
- every material conflict or unknown
- product-record last-checked date

### Proposed score composition

| Component | Maximum | Meaning |
| --- | ---: | --- |
| Body-dimension fit | 35 | Seat-height and seat-depth range overlap |
| Desk compatibility | 20 | Desk and armrest-clearance compatibility |
| Adjustment coverage | 20 | Useful adjustment range for entered conditions |
| Use-condition fit | 15 | Work duration, posture, material, and selected priorities |
| Data completeness | 10 | Availability and freshness of required published fields |
| **Total** | **100** | Explainable Fit Score |

The exact production weights may be calibrated after data analysis, but the visible component names must remain stable. Never display more precision than the evidence supports; use whole numbers only.

### Score guardrails

- A hard dimensional conflict prevents a `Good` status regardless of total score.
- Missing a required dimension caps confidence and lowers the data-completeness component.
- A chair with limited evidence cannot outrank a similarly suitable chair with complete verified data solely because of editorial or popularity signals.
- Do not increase a fit score because a product has an affiliate link, higher commission, famous brand, or more expensive price.
- If fewer than two physical-fit fields are known, show `Incomplete data` instead of a prominent numeric score.
- Provide a short “How this score works” disclosure beside the first score and in the methodology drawer.

## Result architecture

### 1. Fit Passport header

Keep the user’s suggested ranges visible above the recommendations:

- suggested seat-height range
- suggested seat-depth range
- entered desk height and clearance requirement
- selected work conditions or priorities
- method version and calculation date
- local save and print/PDF actions

Do not expose weight, pain selections, precise location, or other private inputs in public URLs or share images.

### 2. Five standout matches

Show five prominent recommendations. They are a curated set of distinct roles rather than a simple first-to-fifth podium.

Default role pool:

1. **Best Overall Fit** — strongest balanced result across physical fit, desk compatibility, adjustment coverage, and data quality.
2. **Best Value Fit** — strongest qualifying fit within a lower price band; price never compensates for a hard fit conflict.
3. **Best for Long Workdays** — strong adjustment coverage and evidence relevant to prolonged task seating.
4. **Best for Lumbar Adjustability** — strong lumbar adjustability evidence. Do not imply treatment or pain relief.
5. **Best to Try Nearby** — a sufficiently strong fit with a verified exact-model trial location.

Adaptive alternatives:

- Most Adjustable
- Best Verified Data
- Best Mesh Option
- Best Cushioned Option
- Best for Petite Users
- Best for Tall Users
- Best for Reclining
- Best for Small Spaces
- Best Lower-Price Alternative

Only display a role when a candidate meets its minimum evidence requirements. If no chair qualifies, omit that role and promote the next valid role. Never manufacture five labels merely to fill the grid.

### Role assignment rules

- Assign **Best Overall Fit** first.
- Assign remaining roles from eligible candidates using role-specific subscores.
- A product should normally receive one standout role.
- Allow one product to hold two roles only when fewer than three distinct candidates meet the minimum evidence threshold; disclose both labels on one card rather than duplicating the card.
- A role label describes the strongest supported reason for inclusion, not an absolute market-wide award.
- Nearby roles require an exact-model verification record. Brand-carried stores do not qualify.
- Lumbar roles require structured adjustment data or cited editorial measurement, not marketing copy alone.
- Value roles require usable regional price data and should show the price-check date.

### Standout card content

Each card contains:

- role title
- real catalog image or official missing-image fallback
- manufacturer and model
- Fit Score when evidence is sufficient
- fit status and confidence
- score-component disclosure
- two strongest supporting reasons
- one most important trade-off, conflict, or unknown
- published range versus user range control
- product-record last-checked date
- price range with market and checked date when available
- exact-model and brand-carried showroom counts shown separately
- `Why this pick`, `Open chair dossier`, `Compare`, and `Find a place to try` actions

The card should make the evidence more visually prominent than the numeric score.

## More matches: positions 6–10

Below the standout set, show up to five compact alternatives under **More chairs that meet most of your requirements**.

Use `Alternative 06` through `Alternative 10` as quiet reference labels. Do not style these as a competitive podium.

Each compact row contains:

- thumbnail
- manufacturer and model
- Fit Score or `Incomplete data`
- one differentiating strength
- one warning or unknown
- price band
- comparison checkbox or action
- expandable evidence rail

On mobile, use full-width rows with the evidence rail opening inline. Avoid a horizontal card carousel as the only way to access alternatives.

## Desktop composition

1. Fit Passport summary and actions
2. Results introduction with candidate and fit-ready data coverage
3. Featured **Best Overall Fit** card spanning the main width
4. Four remaining standout cards in a two-column grid
5. Persistent evidence rail or side panel that updates when a card receives hover, focus, or selection
6. More Matches 6–10 compact table/list
7. Compare selected chairs
8. Showroom handoff
9. Methodology, source hierarchy, and data limitations

The persistent evidence rail should remain in a stable position. Do not make every card repeat a large chart.

## Mobile composition

1. Compact sticky Fit Passport summary
2. Featured Best Overall card
3. Other standout cards as a vertical list
4. Tap-to-expand evidence section within the selected card
5. More Matches compact rows
6. Sticky compare tray only after the user selects two or more chairs
7. Map remains optional; showroom list is the primary accessible experience

Keep the title, first recommendation, Fit Score meaning, and primary evidence within the first two mobile viewports.

## Interaction specification

- Selecting, hovering, or focusing a chair updates one persistent evidence rail.
- Animate range changes with transforms and opacity over 120–180 ms.
- The initial result reveal may transform the abstract chair outline into the Best Overall product image over 220–320 ms.
- Expanding `Why this pick` reveals score components, conflicts, unknowns, and sources without navigating away.
- Selecting Compare adds the product to a persistent comparison tray; maximum four products.
- Selecting a showroom action preserves the chosen chair and distinguishes exact-model verification from brand-level availability.
- Honor `prefers-reduced-motion` with immediate state changes and no shared-element transition.
- Never introduce fake analysis waits, count-up theater, confetti, parallax, or continuously moving score graphics.

## Required states

Claude Design must include desktop and mobile treatments for:

- ten or more valid candidates
- six to nine candidates
- fewer than five candidates
- one valid candidate
- no physical-fit candidate
- candidates with incomplete dimensions
- catalog unavailable
- price unavailable or stale
- no nearby showroom
- brand-carried showroom only
- exact model verified nearby
- location permission denied
- saved Fit Passport
- print/PDF Fit Passport
- reduced motion
- keyboard focus and expanded evidence

## Data shown on the page

Separate these concepts visibly:

- **Full catalog count:** all published Chairpedia chair records
- **Fit-ready count:** records with enough required dimensions to calculate physical fit
- **Candidate count:** fit-ready records evaluated for this user
- **Displayed count:** up to ten results shown on this page

Recommended copy pattern:

> 38 catalog chairs had enough published dimensions for this fit check. Ten are shown here. Chairs with missing required measurements remain available in the full catalog but are not given a confident Fit Score.

Do not hard-code these numbers in the design.

## Copy guidance

Preferred:

- Fit Score 86/100
- Good range overlap
- Check seat-depth configuration
- Published dimension not available
- Strong lumbar adjustability evidence
- Exact model verified here
- Brand carried — confirm model before visiting

Avoid:

- 86% compatible
- Perfect match
- Guaranteed comfort
- Best chair for back pain
- Medically recommended
- AI confidence
- Scientifically proven fit

## Design deliverables

Claude Design should provide:

1. Desktop result page at 1440 px
2. Mobile result page at 390 px
3. Featured and standard standout-card variants
4. Compact More Matches row and expanded state
5. Persistent evidence rail in desktop and mobile forms
6. Fit Score breakdown drawer
7. Compare-selection tray
8. Showroom availability states
9. All empty, loading, unavailable, and insufficient-data states
10. Print/PDF Fit Passport layout
11. Responsive constraints, tokens, component names, interaction timing, focus order, and reduced-motion behavior
12. Clickable prototype covering result selection, evidence expansion, comparison, and showroom handoff

Use real Chairpedia catalog records and approved product images where available. Never invent product names, specifications, prices, showroom claims, or commercial-chair imagery.

## Product and data work required from Chairpedia

The owner or product team needs to decide or supply:

1. **Score approval:** approve the five score components and their initial weights.
2. **Role priority:** approve the default role pool and which roles may depend on user-entered priorities.
3. **Medical-language policy:** approve the non-medical wording for lumbar and posture-related roles.
4. **Price market:** choose the default region and currency, plus the stale-price threshold.
5. **Showroom verification:** define how long exact-model and brand-carried confirmations remain current.
6. **Data ownership:** identify who is responsible for completing missing chair dimensions and resolving conflicting values.
7. **Photography rights:** confirm which catalog images are approved for result cards.
8. **Methodology review:** nominate the person who signs off Fit Method 1.0 and future revisions.

Design can begin before these decisions are final. Use clearly marked variables and avoid fabricated sample claims.

## Acceptance criteria

The result design is ready when a user can:

- understand that Fit Score is an index rather than a probability
- see why each standout chair has a different role
- identify conflicts and missing information without opening another page
- compare the same personal range against multiple chairs
- access alternatives 6–10 without losing context
- distinguish exact-model showrooms from brand-only availability
- save or print a privacy-safe Fit Passport
- complete the flow with keyboard navigation and reduced motion
