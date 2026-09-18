# Chair Fit Calculator — Interaction and Visual Direction

## Creative direction

The calculator should feel like a precision fitting session inside a refined furniture showroom. It must not look like a generic SaaS quiz, chatbot, medical form, or neon AI product.

The visual idea is **Body, Chair, Place**:

1. **Body** — establish the user's physical and working context.
2. **Chair** — reveal measured fit, trade-offs, and evidence.
3. **Place** — move the user from a screen to a real showroom or verified seller.

The interaction should be memorable because the user's inputs visibly change a chair-fitting diagram and then unfold into a real-world showroom map.

## Brand expression

- Use Chairpedia's editorial serif for decisive headlines and a neutral sans serif for measurements and controls.
- Base palette: warm paper, ink black, mineral blue, and a restrained signal yellow.
- Fit states use color plus text and iconography: green/Good fit, amber/Conditional, gray/Insufficient data.
- Product photography remains the visual hero. Never enlarge low-quality images; use the existing designed chair fallback instead.
- Avoid glassmorphism, glowing AI orbs, heavy gradients, and playful quiz-card colors.
- Motion should communicate measurement, comparison, and movement through space.

## Desktop composition

Use a two-column stage after the opening statement.

### Left: fitting controls

- Compact step title and one-sentence explanation
- Inputs with editable values and unit toggles
- Visible progress expressed as Body / Work / Preferences / Results
- Back and continue actions anchored consistently

### Right: living fit model

- A clean line illustration of a seated body, chair, and desk
- Dimension lines for seat height, seat depth, and desk clearance
- The illustration updates immediately as values change
- Safe ranges appear as soft bands; conflicts become amber callouts
- Avoid pretending that the illustration is a precise body scan

The illustration is functional feedback, not decoration.

## Mobile composition

- No full global header while the fitting flow is active; use a 52 px compact bar with Chairpedia, progress, and exit.
- Keep one question group visible at a time.
- Place the fit illustration in a collapsible 34–40% top stage.
- Use a thumb-friendly bottom action area that respects safe-area insets.
- Results are cards in a vertical feed; showroom results open as a bottom sheet over a lightweight map preview.
- Preserve answers when moving back.

## Opening sequence

### Frame 1

Headline: **Find a chair that fits your body and your desk.**

Supporting copy: **Get measurement-backed matches, see what may not fit, and find places to try your shortlist in person.**

Primary action: **Calculate my fit**

Secondary action: **Check chairs I already know**

Evidence strip:

- Product dimensions
- Reader and editorial evidence
- Worldwide chair showrooms

### Start interaction

On start, the headline contracts into the compact progress bar while the body/chair/desk drawing resolves from three simple lines. Respect reduced-motion settings with an immediate state change.

## Input interactions

### Height and weight

- Pair sliders with editable numeric fields.
- Unit changes animate only the number, not the entire screen.
- Weight is optional and explains that it is used only for capacity margin.
- Never silently submit default average values.

### Desk fit

- Ask for desk height and whether armrests must tuck below it.
- “I don't know” opens a 15-second measuring instruction rather than blocking progress.
- As desk height changes, the diagram's clearance band moves.

### Work pattern

Use three posture cards with restrained micro-animation:

- Mostly upright
- Move throughout the day
- Recline often

Card selection changes the illustrated posture. Do not use 3D tilt effects on touch devices.

### Comfort concerns

Use a body outline with large accessible targets and an adjacent text list. Selecting a region highlights the matching list item. State clearly that this prioritizes features and is not medical advice.

### Preferences

Use material swatches only when texture is meaningful. Feature priorities are limited to four, with the current count visible.

## Analysis transition

Do not force a fake waiting screen. If the response is immediate, move directly to results. If it takes longer than 300 ms, show real stages:

- Checking body and seat ranges
- Checking desk clearance
- Matching preferences and evidence
- Looking for places to try your matches

The chair outline should align with the calculated safe-range bands as each stage completes.

## Result reveal

### Fit passport

The first result module is a compact **Your fit passport** card:

- Suggested seat-height range
- Suggested seat-depth range
- Desk-clearance requirement
- Top three adjustment priorities
- Confidence note and methodology link

It can be copied or saved locally, but body values must not be placed in readable public URLs.

### Product result card

The leading card uses a split layout:

- Product image and basic identity
- Fit status and confidence
- Measurement diagram comparing user range with chair range
- Evidence, conflicts, and unknowns in separate groups
- Price and availability are secondary to fit

Primary action: **Explore this chair**

Contextual actions:

- **Compare**
- **Try in a showroom**
- **Check price in [market]**

Avoid match percentages at launch. Use the component range graphics to show how the judgment was reached.

### Alternatives

Show two alternatives with explicit trade-offs, such as:

- Better desk clearance
- Wider seat, less certain depth
- Lower price, fewer verified dimensions

This makes the list feel selected rather than interchangeable.

## Showroom moment

Showrooms are a core result section, not a footer CTA.

### Transition

After the product shortlist, the page asks:

**Want to feel the difference before you buy?**

The selected chair image reduces into a map marker. A local map panel expands from the card edge into a country- or location-aware view.

### Store hierarchy

1. **Confirmed to try** — the exact model has a verified trial record.
2. **Brand carried** — the brand is verified, but the exact model must be confirmed before visiting.

Every store card includes city, visit arrangement, last checked date, distance when permission is granted, and a clear “Confirm before visiting” note when required.

Actions:

- **View store**
- **Get directions**
- **Open all matching stores**

Request browser location only after the user selects **Find near me**. Country selection works without location permission.

## Compare interaction

- Allow up to three chairs.
- A small persistent compare tray appears after the first selection.
- The comparison view leads with user-relevant rows: seat range, depth, capacity, desk clearance, confidence, nearby trial options.
- Unknown values remain visible as “Not published”; never render them as dashes without explanation.

## Conversational follow-up

Keep chA.I.r as a narrow, contextual layer titled **Ask about these matches**.

Preset questions appear first. Free text expands only when selected. The assistant must cite the visible product evidence and say when data is missing. It must never replace the deterministic fit judgment.

## Motion specification

- Page transition: 240–320 ms, ease-out
- Input feedback: 120–180 ms
- Range-bar changes: spring with low overshoot
- Map expansion: 360–450 ms, transform and opacity only
- Result cards: stagger no more than 60 ms each
- No artificial delays
- Disable cursor-following effects and pointer parallax
- Honor `prefers-reduced-motion`

## Empty and degraded states

- Missing product dimensions: show **Fit data incomplete** and list the missing fields.
- No product matches: retain the fit passport, explain which hard constraint removed products, and offer one input to relax.
- No local showroom: show matching stores in the selected country, then worldwide options; link to the full map.
- Showroom service unavailable: recommendations remain functional.
- AI unavailable: the entire calculator and showroom path remain functional.
- Missing photo: use the designed chair fallback with no empty image box.

## Accessibility

- Every visual measurement has a text equivalent.
- Do not rely on color alone for fit status.
- Sliders have visible numeric inputs and keyboard steps.
- Map is supplementary; stores are always available as a semantic list.
- Focus follows step changes and returns correctly from sheets/dialogs.
- Minimum target size is 44 by 44 px.

## Copy principles

- English only.
- Prefer “suggested range” and “may fit” over certainty.
- State the evidence before the recommendation claim.
- Use “comfort concern,” not diagnosis.
- Use “confirmed to try” only for verified exact-model records.
- Use “brand carried — ask first” for brand-level records.

## Required design deliverables

1. Desktop opening and four input states
2. Mobile opening and all critical input states
3. Fit passport
4. Good, conditional, and insufficient-data result cards
5. Desktop showroom expansion and mobile showroom bottom sheet
6. Three-chair comparison state
7. No match, no showroom, missing dimensions, API failure states
8. Reduced-motion behavior notes
9. Component tokens and responsive specifications
10. Clickable prototype covering start through showroom selection

## Acceptance standard

The design is ready when a first-time visitor can answer three questions without explanation, understand why the first chair fits or may not fit, distinguish an exact-model showroom from a brand-level store, and reach the relevant product, comparison, or store in one action.
