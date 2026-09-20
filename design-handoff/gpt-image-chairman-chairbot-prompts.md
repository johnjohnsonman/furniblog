# GPT Image prompts — ChairMan and ChairBot web assets

Use the supplied official ChairPark character sheet as the **identity reference image** for every generation. Generate each numbered set separately. Do not ask for every asset in one image.

## Shared identity lock

Paste this block at the beginning of every request:

> Use the attached ChairPark official character sheet as the strict character identity reference. Preserve the same recognizable ChairMan and ChairBot proportions, faces, materials, colors, and friendly premium character design across every output.
>
> ChairMan is a soft white segmented mascot with the original reference's short, stocky, cuddly proportions: a very large round head, wide padded torso and rounded belly, thick short segmented arms and legs, broad rounded mitten-like hands, compact feet, small black oval eyes, a simple black smile, and a low center of gravity. He must look warm, substantial, and friendly rather than athletic, tall, slim, anatomical, or mannequin-like. His signature outfit is a charcoal padded vest with matching charcoal relaxed-fit trousers, and it must remain on in every consumer-facing pose unless the request explicitly says “measurement silhouette only.” Use the same vest shape, quilting, collar, badge placement, trouser cut, waist, and ankle break in every image. Keep the compact white feet with dark soles visible below the trousers.
>
> ChairBot is a compact white chair-shaped robot with a rounded rectangular black face screen, turquoise eyes and mouth, one turquoise-tipped antenna, small articulated arms, a padded white body, an ergonomic mesh-chair back, armrests, and four small black caster wheels. ChairBot must remain visibly chair-inspired rather than becoming a generic robot.
>
> Visual style: refined premium 3D product-character rendering, soft tactile materials, subtle studio lighting, warm off-white background, clean Chairpedia editorial mood, believable contact shadows, polished but not toy-plastic, friendly but not childish. Maintain exact character consistency between images.
>
> **Non-negotiable seated-posture rule:** whenever ChairMan is seated, both feet must be fully supported with the entire soles visibly resting flat on the floor, placed naturally below or slightly in front of the knees. Knees should be approximately 90–100 degrees and hips should be level with or slightly higher than the knees. Lower the chair only to a mechanically believable minimum. If the chair cannot be lowered further without colliding with its gas lift or five-star base, lengthen both lower-leg segments equally and modestly until the soles reach the floor. Preserve their thick plush diameter, segment count, and left-right symmetry; do not lengthen the thighs, torso, arms, or overall standing character. Never make his feet hover, let them dangle, cross his legs, or rest his feet on the chair base or casters. Show a subtle floor contact shadow directly beneath both soles. Unless a separate footrest is explicitly requested, this rule also applies to reclined poses.
>
> Do not add Korean or English text, captions, labels, speech bubbles, logos, watermarks, interface screens, random accessories, extra fingers, extra limbs, duplicated casters, distorted chair geometry, or invented brand marks. Do not redesign the characters.

## Canonical-reference priority

The original ChairMan images supplied before the trouser experiments are the canonical identity. When those images and a later model sheet conflict, follow the original images. The later model sheet may be used only to understand the requested trousers and view layout.

Prefer an image edit of an original ChairMan render over a new text-to-image generation. The edit must change only the explicitly requested lower-body clothing or pose. Preserve the original face pixels and visual identity as closely as possible: larger vertical oval eyes, small curved eyebrows, compact smile, soft slightly asymmetrical head, broad cheeks, oversized rounded hands, plush segmented arms and legs, wide belly, original soft charcoal vest, broad collar, and hanging rectangular character badge.

Never substitute the later interpretation's small close-set eyes, perfectly spherical head, generic vinyl-toy expression, clenched hanging fists, center-zip outdoor puffer, pockets, round chest pin, narrower torso, or longer legs.

## 0. First required edit — add trousers without redesigning ChairMan

Attach one original ChairMan image as the primary edit image. Attach the other original ChairMan images only as identity references. Do not attach the later trouser model sheet for this edit.

> Edit the attached original ChairMan image. Change the exposed white lower-body area by adding soft matte charcoal relaxed-fit trousers tailored to his existing short, wide, plush proportions. Preserve the original image's ChairMan identity exactly: do not redraw or reinterpret the head, face, eyes, eyebrows, smile, cheeks, hands, arms, torso, belly, vest, broad collar, hanging rectangular badge, camera, lighting, materials, or background. The trousers should sit naturally below the existing vest, show a readable knee position, end cleanly above the existing compact white feet, and leave the dark soles visible. If the source pose has floating or dangling feet, correct the seated geometry as part of the edit. Lower the chair only if its mechanism allows it realistically; otherwise lengthen both lower-leg segments equally and modestly and reposition the feet until both entire soles rest flat on a visible floor plane below or slightly in front of the knees. Preserve the thick plush leg diameter and do not alter the thighs, torso, head, or overall character width. Do not add a zipper, pockets, belt, round badge, new logo, shoes, or new accessories. Do not slim the body. This is a localized wardrobe and ergonomic-contact edit, not a character redesign.

Run this edit separately for each approved original pose. Do not request a turnaround sheet or multiple poses until one edited pose has been approved as the new canonical master.

## 1. Character master turnaround

> Create a clean visual identity model sheet for ChairMan and ChairBot. This sheet is for approval and reference; it is not a layered production rig.
>
> Show each character in four separate full-body views: front, left side, three-quarter front, and back. Use identical scale, neutral posture, consistent camera height, and consistent lighting. ChairMan wears the same charcoal padded vest and matching charcoal trousers in all four views and retains the original short, wide, cuddly proportions. The trousers fit his rounded body naturally without narrowing the waist or lengthening the legs. ChairBot should show its chair back, armrests, antenna, articulated arms, and four caster wheels clearly in every view.
>
> Composition: spacious 2 × 4 reference grid, warm off-white seamless studio background, no panel borders, no text, no arrows, no measurements. Every view must be fully visible and separated with generous margins. 16:9 landscape, high resolution.

## 2. ChairMan fitting pose sheet

> Create six consistent full-body ChairMan poses for a premium chair-fit calculator:
>
> 1. standing neutrally for body measurement,
> 2. sitting upright with both entire soles visibly flat on the floor and knees near 90 degrees,
> 3. sitting dynamically with a slight forward work posture while both entire soles remain flat on the floor,
> 4. reclining comfortably with the chair supporting the back while both entire soles remain supported on the floor,
> 5. measuring desk clearance with one hand near the armrest,
> 6. standing up and gesturing toward a showroom location.
>
> Keep the same ChairMan identity and the same neutral black mesh ergonomic chair wherever seated. Set the chair low enough for ChairMan's short legs; do not solve the posture by changing his body proportions. Accurate, believable seated anatomy, full sole-to-floor contact, and chair contact are essential. Separate each pose with generous space. Warm off-white background, soft contact shadows, no text, no diagram lines, no cropped body parts. 3:2 landscape, high resolution.

> ChairMan wears the same charcoal padded vest and matching relaxed-fit charcoal trousers in every pose. Preserve his wide padded torso, rounded belly, thick short limbs, compact feet, and large round head. The trouser knee and ankle construction must make the seated knee angle and full foot-to-floor contact easy to read. Do not make the body slimmer or taller to fit the chair.

After the pose sheet is approved, regenerate each approved pose separately as a single full-frame isolated character asset. Do not use crops from the contact sheet as final web assets.

### 2A. Production export sequence — run one request at a time

Attach the approved master sheet to every request. Do not ask GPT Image for more than one pose, view, or file in a single generation. Start each request with the shared identity lock, then append exactly one item below.

1. `chairman-standing-neutral.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan standing neutrally in three-quarter front view. Preserve the approved face, short stocky proportions, charcoal padded vest, matching trousers, compact white feet, materials, camera height, and lighting. Show only this one pose and one character.
2. `chairman-seated-upright.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan seated upright in a neutral black mesh ergonomic chair in three-quarter view. Both entire soles rest flat on the floor and the knees are approximately 90–100 degrees. Show only this one pose and one character.
3. `chairman-seated-working.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan seated with a slight forward working posture at a minimal desk. Both entire soles remain flat on the floor. Show only this one pose, one character, one chair, and the minimum desk edge needed to explain the posture.
4. `chairman-seated-reclined.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan reclining naturally in a neutral black mesh ergonomic chair. The back is supported and both entire soles remain flat on the floor. Show only this one pose and one character.
5. `chairman-desk-clearance.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan seated beside a minimal desk, gesturing toward the armrest-to-desk clearance. Both entire soles remain flat on the floor. Do not add measurement graphics or text. Show only this one pose and one character.
6. `chairman-showroom-guide.png`
   > Using the attached approved ChairMan master as the exact identity reference, render one full-body ChairMan standing in three-quarter view and making one welcoming open-hand showroom gesture. Show only this one pose and one character.

For every item above, use a perfectly uniform solid chroma-green background (#00FF00), no green spill, no text, no labels, no contact-sheet layout, no duplicate character, and no additional views. Keep the whole character and any required chair fully inside the frame with generous transparent-cutout margin. Square 1:1 or portrait 4:5, high resolution.

## 3. ChairBot expression and status sheet

> Create eight consistent ChairBot states for a chair-fit calculator. Keep the body pose restrained and communicate primarily through the turquoise face display and one small functional gesture:
>
> neutral, measuring, checking data, good fit confirmed, conditional fit warning, missing data, comparing options, and showroom found.
>
> Use a calm turquoise display for neutral/positive states, a restrained amber signal for conditional fit, and neutral gray plus a question symbol made only as a simple screen icon for missing data. Do not add words or speech bubbles. Keep every ChairBot identical in proportions and materials. Arrange as a clean 4 × 2 asset sheet on a warm off-white background with generous spacing. 16:9 landscape, high resolution.

## 4. Opening hero scene

> Create a premium Chairpedia chair-fit calculator hero image using the reference ChairMan and ChairBot.
>
> ChairMan is seated naturally in a refined black mesh ergonomic office chair beside a minimal desk. Both entire soles rest visibly flat on the showroom floor, his knees are near 90 degrees, and the chair is adjusted low enough to fit his short proportions. ChairBot stands near the chair and performs a subtle turquoise measurement scan of seat height, seat depth, and desk clearance. Show the measurement idea through three restrained translucent bands and small geometric markers, without text or numerical labels.
>
> The environment should feel like a high-end contemporary furniture showroom: warm mineral-white walls, pale oak or warm stone floor, soft architectural lighting, a few softly out-of-focus office chairs in the distance. Leave clean negative space on the left for an English headline and CTA. Characters and chair occupy the right half. Editorial product photography composition, not a cartoon scene. 16:9 landscape, high resolution, no text or logos.

## 5. Measurement-stage isolated assets

> Create **one** isolated web asset per generation, based on the reference characters. Run this request four times, changing only the requested asset:
>
> A. ChairMan seated upright in strict side profile with both entire soles flat on the floor,
> B. ChairMan seated and reclining in strict side profile with both entire soles still supported on the floor,
> C. ChairBot in three-quarter view performing a measurement scan,
> D. ChairBot in three-quarter view showing a restrained conditional warning.
>
> Render only the selected asset, centered and fully visible, on a perfectly uniform solid chroma-green background (#00FF00) with no green reflections on the character, so the background can be removed cleanly. Preserve the full body, chair wheels, antenna, and all extremities. ChairMan must wear the signature charcoal padded vest and matching charcoal trousers, with his compact feet and dark soles visible. No text, no labels, no decorative particles. Square 1:1 or portrait 4:5, high resolution.

After generation, remove the green background and export each asset as a separate transparent WebP and PNG. GPT Image may not provide a reliable alpha channel or layered source directly, so do not describe the output as production-ready until the cutouts have been checked manually.

## 6. Showroom transition scene

> Create a premium transitional scene for a Chairpedia result-to-showroom animation.
>
> ChairMan has just stood up from a black ergonomic chair and gestures toward the real showroom around him. ChairBot stands beside the chair and projects one simple turquoise location-pin shape from the chair base. The chair remains the visual center. Use the same warm high-end showroom language as the hero scene, with softly blurred chair displays behind them.
>
> Leave clear empty space around the projected marker so it can be animated into a map pin in the interface. No map, no UI, no text, no labels, no logos. 16:9 landscape, high resolution.

## 7. Mobile onboarding portrait

> Create a vertical mobile onboarding visual for Chairpedia using the same ChairMan and ChairBot identities.
>
> ChairMan sits correctly in a black mesh ergonomic chair while ChairBot checks the chair-to-desk clearance. Both entire soles must be visibly flat on the floor, with knees near 90 degrees and the chair lowered to fit his short proportions. Keep both characters centered in the lower two-thirds. Leave the top 30% as calm negative space for an English title. Warm off-white showroom background, restrained depth of field, premium editorial lighting, readable at small size, no text, no logos. 9:16 portrait, high resolution.

## Revision prompt when identity drifts

> The characters have drifted from the attached official reference. Regenerate while matching the approved identity exactly: ChairMan's round head, small black oval eyes, simple smile, segmented white arms, charcoal padded vest, matching relaxed-fit charcoal trousers, visible compact feet with dark soles, mitten-like hands, and sturdy proportions; ChairBot's chair-shaped body, black rounded face screen, turquoise facial display, single antenna, mesh chair back, armrests, articulated arms, and four caster wheels. Remove all unapproved costume changes, extra accessories, generic robot features, and altered facial proportions. Keep the requested pose and composition unchanged.

## Revision prompt when the result resembles the later model sheet

> Revert ChairMan to the attached original character, which is the only canonical identity reference. Preserve the current trousers, pose, chair, and composition, but restore the original larger vertical oval eyes, small curved eyebrows, compact smile, soft slightly asymmetrical head, broad cheeks, oversized rounded hands, plush segmented limbs, wide belly, original soft charcoal vest with broad collar, and hanging rectangular badge. Remove the generic center zipper, pockets, round chest pin, small close-set eyes, perfectly spherical mannequin head, clenched fists, narrow torso, and long legs. Do not create a new interpretation. Match the original ChairMan as closely as an image edit allows.

## Revision prompt when ChairMan becomes slim or loses his outfit

> Restore ChairMan to the approved identity and preserve the requested pose and composition. He must be short, wide, soft, stocky, and cuddly, with a very large round head, wide padded torso, rounded belly, thick short segmented arms and legs, broad mitten-like hands, compact feet, and a low center of gravity. Put the signature charcoal padded vest and matching relaxed-fit charcoal trousers back on him, matching the established quilting, collar, volume, badge placement, trouser waist, cut, and ankle break. The outfit should fit naturally over his rounded body. Keep the compact white feet with dark soles visible. Do not show a bare torso, bare legs, generic white bodysuit, narrow waist, long limbs, athletic anatomy, medical mannequin proportions, or exposed robotic joints. Do not alter ChairBot, the chair, camera, lighting, or background.

## Revision prompt when ChairMan's feet float

> Edit the attached image and correct only ChairMan's lower legs and foot contact. The chair is already near its mechanically lowest believable position, so do not compress the gas lift into the five-star base or distort the chair. Create a clearly visible horizontal floor plane beneath the chair. Lengthen the left and right lower-leg segments equally and only as much as required for both complete dark shoe soles to rest naturally and visibly flat on that same floor plane. Preserve the legs' thick plush diameter, rounded segmented construction, trouser fit, and left-right symmetry. Do not lengthen the thighs, torso, arms, or neck, and do not make ChairMan taller or slimmer overall. Reposition the feet below or slightly in front of the knees, parallel or slightly turned outward, with knees approximately 90–100 degrees. Add slight sole compression and a contact shadow directly beneath each entire sole. Neither foot may hover, dangle, cross, touch a caster, rest on the five-star base, tilt toward the camera, or disappear behind the other foot. Preserve the approved face, eyebrows, expression, head, hands, torso, vest, rectangular badge, chair design, reclined backrest angle, camera, lighting, and composition. Return one corrected image only.

## Export checklist

- Character silhouettes match the official reference at thumbnail size.
- ChairMan's seated body makes believable contact with the chair.
- In every standard seated pose, both entire soles visibly contact the floor and neither foot floats.
- ChairBot has one antenna, two arms, one chair back, and four coherent casters.
- No product chair is represented as a named commercial model.
- No embedded text, logos, labels, or speech bubbles.
- Background-removal assets have clean edges at hands, antenna, mesh, and casters.
- Desktop hero works with headline copy on the left.
- Mobile asset remains readable at 320–393 px viewport width.
- Final web exports: AVIF/WebP for scenes, transparent WebP/PNG for characters, SVG created separately for measurement lines and status icons.
