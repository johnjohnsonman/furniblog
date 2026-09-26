/**
 * Official specifications for top compared chairs, keyed by product slug.
 *
 * Every value comes from a brand source (spec sheet, product page or official
 * store) with its URL, the date it was read and the exact quoted wording.
 * Fields with no official statement are left out rather than estimated.
 * Where sources disagree (e.g. Aeron seat height on the specs page vs the
 * store), each value is kept with its own scope. Field names mirror planned DB
 * columns (camelCase here, snake_case in the table), as in price-provenance.
 * `computedMetric` is a conversion we calculated, not an official figure.
 */

export type OfficialSpecValue = {
  value: string
  unit?: string
  /** Size or configuration the value applies to. */
  scope?: string
  sourceUrl: string
  sourceTitle?: string
  /** ISO date the source was read. */
  checkedOn?: string
  /** Exact official wording. */
  quote?: string
  computedMetric?: string
}

export type OfficialSpecField =
  | "sizes" | "seatHeight" | "seatDepth" | "seatWidth" | "backHeight" | "weightCapacity"
  | "recline" | "arms" | "lumbar" | "headrest" | "warranty" | "chairWeight"

export type OfficialSpecs = { officialName: string } & Partial<Record<OfficialSpecField, OfficialSpecValue[]>>

export const officialSpecs: Record<string, OfficialSpecs> = {
  "herman-miller-aeron": {
    officialName: "Aeron Chair (current; store FAQ calls it 'the remastered Aeron')",
    sizes: [
      {
        value: "A (Small), B (Medium), C (Large)",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Comes in three sizes (A, B, and C) for the right fit"
      }
    ],
    seatHeight: [
      {
        value: "14.4–19.3",
        unit: "in",
        scope: "Size A (all arm options)",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Aeron Chair–A Size–Armless … Seat Height: 14.4\"–19.3\"",
        computedMetric: "36.6–49 cm"
      },
      {
        value: "14.8–22.8",
        unit: "in",
        scope: "Size B",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Aeron Chair–B Size–Armless … Seat Height: 14.8\"–22.8\"",
        computedMetric: "37.6–57.9 cm"
      },
      {
        value: "15.8–22.8",
        unit: "in",
        scope: "Size C",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Aeron Chair–C Size–Armless … Seat Height: 15.8\"–22.8\"",
        computedMetric: "40.1–57.9 cm"
      },
      {
        value: "B and C: range may vary depending on cylinder height",
        scope: "note on B/C ranges above",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Size B 14.8–22.8''* Size C 15.8–22.8''* … *range may vary depending on cylinder height"
      },
      {
        value: "14.75–19",
        unit: "in",
        scope: "Size A as sold (store configuration)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Size A - Small … Seat Height Min (in): 14¾ Seat Height (in): 19",
        computedMetric: "37.5–48.3 cm"
      },
      {
        value: "16–20.5",
        unit: "in",
        scope: "Size B as sold (store configuration)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Size B - Medium … Seat Height Min (in): 16 Seat Height (in): 20½",
        computedMetric: "40.6–52.1 cm"
      },
      {
        value: "16–20.5",
        unit: "in",
        scope: "Size C as sold (store configuration)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Size C - Large … Seat Height Min (in): 16 Seat Height (in): 20½",
        computedMetric: "40.6–52.1 cm"
      }
    ],
    seatDepth: [
      {
        value: "16 / 17 / 18.5 (fixed)",
        unit: "in",
        scope: "Size A / B / C",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "A Size … Seat Depth: 16\" | B Size … Seat Depth: 17\" | C Size … Seat Depth: 18.5\"",
        computedMetric: "40.6 / 43.2 / 47.0 cm"
      },
      {
        value: "16.4 / 17 / 18.9 (fixed)",
        unit: "in",
        scope: "Size A / B / C",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Seat depth 16.4'' Size A 17'' Size B 18.9'' Size C",
        computedMetric: "41.7 / 43.2 / 48.0 cm"
      }
    ],
    weightCapacity: [
      {
        value: "300 / 350 / 400",
        unit: "lb",
        scope: "Size A / B / C",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "300 lb/136 kg … 350lbs … 400 lbs … Maximum user weight size A / B / C",
        computedMetric: "136 (official) / 158.8 / 181.4 kg"
      },
      {
        value: "300 / 350 / 400",
        unit: "lb",
        scope: "Size A / B / C",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Capacity (lbs): 300 … 350 … 400"
      }
    ],
    recline: [
      {
        value: "Harmonic 2 Tilt; options: Standard/Basic tilt, Tilt Limiter, Tilt Limiter with Seat Angle",
        scope: "option-dependent",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Tilt options Standard tilt Tilt limiter Tilt limiter with seat angle"
      },
      {
        value: "Tilt Limiter: three settings (upright, mid-, fully-reclined); Seat Angle: 5° forward tilt",
        scope: "Tilt Limiter options only",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Recline range can be adjusted to one of three settings: upright, mid-, and fully-reclined. … Seat Angle Adjustment changes the angle of the seat from horizontal to a 5-degree forward tilt"
      },
      {
        value: "Basic Tilt has no tilt limiter",
        scope: "Basic Tilt option",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "It does not have a tilt limiter mechanism."
      }
    ],
    arms: [
      {
        value: "Options: no arms, fixed (stationary) arms, height-adjustable arms, height-adjustable arms with pivot, fully adjustable arms, fully adjustable arms plus arm pad depth",
        scope: "option-dependent",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Arm options No arms Fixed arms Height-adjustable arms Fully adjustable arms Fully adjustable arms plus arm pad depth"
      },
      {
        value: "Fully Adjustable Arms: height 6.8–10.8 in above seat, 2.5 in fore/aft, pivot 15° out / 17.5° in",
        scope: "Fully Adjustable Arms option",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Fully Adjustable Arms adjust from a height of 6.8 inches above the seat to 10.8 inches above the seat, slide backward and forward over a range of 2.5 inches, and pivot 15 degrees outward and 17.5 degrees inward."
      },
      {
        value: "Arm height 7.5–11.5 in (adjustable arms); 8.5 in (fixed arms)",
        unit: "in",
        scope: "all sizes",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Fully Adjustable Arms … Arm Height: 7.5\"–11.5\" | Fixed Arms … Arm Height: 8.5\""
      }
    ],
    lumbar: [
      {
        value: "Options: No additional support, PostureFit, Adjustable Lumbar Support, Adjustable PostureFit SL",
        scope: "option-dependent",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "No additional support Optional PostureFit Optional Adjustable Lumbar Support Optional Adjustable PostureFit SL Support Optional"
      },
      {
        value: "Adjustable Lumbar Support: 4.5 in vertical range",
        scope: "Adjustable Lumbar option",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Lumbar support can be adjusted vertically over a 4.5-inch range."
      }
    ],
    headrest: [
      {
        value: "None offered by Herman Miller",
        scope: "all",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "The Aeron Chair does not include a headrest as part of its standard design or available factory options."
      }
    ],
    warranty: [
      {
        value: "12-year, 3-shift warranty, with limited exceptions",
        scope: "all",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "We stand behind the quality and performance of our products with a 12-year, 3-shift warranty, with limited exceptions."
      },
      {
        value: "12-year, 3-shift (see MillerKnoll limited warranty)",
        scope: "work chairs",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "12-year, 3-shift For full warranty details, refer to MillerKnoll limited warranty."
      },
      {
        value: "12-year warranty (terms and conditions apply)",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "12-year warranty Terms and conditions apply."
      }
    ],
    chairWeight: [
      {
        value: "40 / 41 / 43",
        unit: "lb",
        scope: "Size A / B / C (store configuration)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight (lbs): 40 … Weight (lbs): 41 … Weight (lbs): 43",
        computedMetric: "18.1 / 18.6 / 19.5 kg"
      }
    ]
  },
  "steelcase-amia": {
    officialName: "Amia (Amia 482 Series); sibling Amia Air",
    seatHeight: [
      {
        value: "16–21",
        unit: "in",
        scope: "standard work chair",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 16\" - 21\"",
        computedMetric: "40.6–53.3 cm"
      },
      {
        value: "16–21 (options 15–19, 17–24)",
        unit: "in",
        scope: "work chair; optional ranges",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Range of adjustability is 5\", from 16\"H to 21\"H, and is standard on work chairs. A lower range of adjustability (15\"H to 19\"H) is available as an option. A higher range of adjustability (17\"H to 24\"H) is available as an option."
      }
    ],
    seatDepth: [
      {
        value: "15.5–18.5 (functional, 3 in adjustment); seat depth 18.5",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat depth adjusts 3\" (15½\"–18½\") by pulling handle up.",
        computedMetric: "39.4–47 cm"
      }
    ],
    seatWidth: [
      {
        value: "19.375",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat width 19 3/8\"W",
        computedMetric: "49.2 cm"
      }
    ],
    weightCapacity: [
      {
        value: "400",
        unit: "lb",
        scope: "chair and stool",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/amia-amia-air/",
        sourceTitle: "Amia Ergonomic Task Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Amia and Amia Air chair and stool are durable enough to handle weight up to 400 lbs",
        computedMetric: "181.4 kg"
      },
      {
        value: "400",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Limit 400 lbs"
      }
    ],
    recline: [
      {
        value: "Full manual recline range with an upright back lock",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Full manual recline range with an upright back lock."
      },
      {
        value: "Seat-to-back angle 100°–120°",
        unit: "deg",
        scope: "work chair (BIFMA CMD)",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat-to-back angle 100° to 120°"
      }
    ],
    arms: [
      {
        value: "4D arms (standard): height, width, depth, pivot",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "With manual adjustments like 4D arms, Amia can handle hours of sitting."
      },
      {
        value: "Standard 4-dimensional arm support; options: height-adjustable arms, armless",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/amia-amia-air/",
        sourceTitle: "Amia Ergonomic Task Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Standard 4-dimensional arm support adjusts to preferred height, width, depth and pivot."
      }
    ],
    lumbar: [
      {
        value: "LiveLumbar (height-adjustable spring force) – standard on Amia",
        scope: "Amia (not Amia Air)",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "LiveLumbar™ Height-adjustable spring force in the lumbar region actively supports the lower back."
      },
      {
        value: "Standard height-adjustable lumbar included with Amia and Amia Air with 3D Microknit back",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/amia-amia-air/",
        sourceTitle: "Amia Ergonomic Task Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Standard height-adjustable lumbar included with Amia and Amia Air with 3D Microknit back."
      }
    ],
    headrest: [
      {
        value: "None listed among official options",
        scope: "steelcase.com Standard + Optional Features",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/amia-amia-air/",
        sourceTitle: "Amia Ergonomic Task Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Amia Options Available as a chair or stool Sewn cushion Upholstered outer back … Armless Height-adjustable arms"
      }
    ],
    warranty: [
      {
        value: "Steelcase Limited Lifetime Warranty – 12 years, multi-shift, 24/7 parts and labor",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/amia-amia-air/",
        sourceTitle: "Amia Ergonomic Task Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "backed by the Steelcase Limited Lifetime Warranty – 12 years, multi-shift, 24/7 parts and labor."
      },
      {
        value: "Limited 12-year Warranty on parts and labor",
        scope: "Steelcase Store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Limited 12-year Warranty on parts and labor."
      }
    ],
    chairWeight: [
      {
        value: "48.4",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/amia",
        sourceTitle: "Amia – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight 48.4 lbs",
        computedMetric: "22 kg"
      }
    ]
  },
  "steelcase-gesture": {
    officialName: "Gesture (Gesture 442 Series)",
    seatHeight: [
      {
        value: "16–21",
        unit: "in",
        scope: "standard work chair",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 16\" - 21\"",
        computedMetric: "40.6–53.3 cm"
      },
      {
        value: "16–21 (optional 14.5–18.25 low, 17–22.5 high)",
        unit: "in",
        scope: "work chair; optional cylinders",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Range of adjustability is 5\", from 16\"H to 21\"H, and is standard on work chairs. An optional 5½\" high-range of adjustability (17\"H to 22½\"H) and a 3¾\" lowrange (14½\"H to 18¼\"H) are available as an option."
      }
    ],
    seatDepth: [
      {
        value: "15.75–18.5 (functional, 2.75 in adjustment); seat depth 18.25",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat depth adjusts 2¾\" (15¾\" to 18½\") by rotating dial while seated",
        computedMetric: "40–47 cm"
      }
    ],
    seatWidth: [
      {
        value: "20 (18.25 at front of cushion)",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat width 20\"W … *Seat width at the front of the cushion is 18¼\"W.",
        computedMetric: "50.8 cm"
      }
    ],
    backHeight: [
      {
        value: "24 1/16 (25 3/8 with headrest)",
        unit: "in",
        scope: "work chair, back height from seat",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Back Height from Seat 24 1/16\" | 25 3/8\" (Work Chair with Headrest)",
        computedMetric: "61.1 cm (64.5 cm with headrest)"
      }
    ],
    weightCapacity: [
      {
        value: "400",
        unit: "lb",
        scope: "chair and stool",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/gesture/",
        sourceTitle: "Gesture Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Gesture chair and stool are durable enough to handle weight up to 400 lbs",
        computedMetric: "181.4 kg"
      },
      {
        value: "400",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Limit 400 lbs"
      }
    ],
    recline: [
      {
        value: "Full manual recline range with three recline angle stop settings and an upright back lock",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Full manual recline range with three recline angle stop settings and an upright back lock."
      },
      {
        value: "Variable back stop: four preset positions",
        scope: "store FAQ",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "a variable backstop dial beneath the right arm rest, which can be rotated to set one of four preset positions"
      },
      {
        value: "Seat-to-back angle 98°–125°",
        unit: "deg",
        scope: "work chair (BIFMA CMD)",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat-to-back angle 98° to 125°"
      }
    ],
    arms: [
      {
        value: "360° Arms",
        scope: "standard; fixed-arm and armless optional",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "360° Arms Adjust through a full range of motion by moving up, down, in, out and pivoting."
      },
      {
        value: "Width 10.25–22.5 in between arms; height 7.25–11.5 in; pivot 15° in/out; depth 2.125 in",
        scope: "360 arm (2021 guide)",
        sourceUrl: "https://www.steelcase.com/content/uploads/2021/04/seating-1.pdf",
        sourceTitle: "Steelcase Seating Specification Guide, April 2021 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Arm width adjusts parallel 6⅛\" per arm for a total range of 10¼\" to 22½\" between arms. Arm height adjusts independently 4¼\" (7¼\"H to 11½\"H) … Arms pivot independently 15° inward and 15° outward … Arm depth adjusts 2⅛\""
      }
    ],
    lumbar: [
      {
        value: "Core Equalizer, with optional additional (height-adjustable) lumbar",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/gesture/",
        sourceTitle: "Gesture Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Core Equalizer provides just the right amount of lumbar support in any angle of recline, with optional additional support available"
      },
      {
        value: "3D LiveBack includes height-adjustable lumbar support",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "3D LiveBack® Mimics the spine's full range of motion and includes height-adjustable lumbar support."
      }
    ],
    headrest: [
      {
        value: "Optional (integrated headrest)",
        scope: "store option No Headrest / Headrest",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Its 360-degree arms, contoured back, manual adjustments and optional headrest are ideal for a precise fit."
      }
    ],
    warranty: [
      {
        value: "Steelcase Limited Lifetime warranty – 12 years, multi-shift, 24/7 parts and labor",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/gesture/",
        sourceTitle: "Gesture Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "backed by the Steelcase Limited Lifetime warranty – 12 years, multi-shift, 24/7 parts and labor."
      },
      {
        value: "Limited 12-year Warranty on parts and labor",
        scope: "Steelcase Store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Limited 12-year Warranty on parts and labor."
      }
    ],
    chairWeight: [
      {
        value: "58",
        unit: "lb",
        scope: "store listing (configuration not specified; page offers headrest option)",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture",
        sourceTitle: "Gesture – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight 58 lbs",
        computedMetric: "26.3 kg"
      }
    ]
  },
  "haworth-fern": {
    officialName: "Fern Office Chair",
    seatHeight: [
      {
        value: "16.5–21.5",
        unit: "in",
        scope: "store (US) configuration",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height: 16.5\"-21.5\"",
        computedMetric: "41.9–54.6 cm"
      }
    ],
    seatDepth: [
      {
        value: "15.5–18.5 (3 in adjustment)",
        unit: "in",
        scope: "store (US)",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth: 15.5\"-18.5\"",
        computedMetric: "39.4–47 cm"
      }
    ],
    seatWidth: [
      {
        value: "19.9",
        unit: "in",
        scope: "store (US)",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Width: 19.9\"",
        computedMetric: "50.5 cm"
      }
    ],
    weightCapacity: [
      {
        value: "350",
        unit: "lb",
        scope: "without forward tilt option",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Warrantied for people up to 350 lbs without forward tilt option",
        computedMetric: "158.8 kg"
      },
      {
        value: "325",
        unit: "lb",
        scope: "with forward tilt option",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Warrantied for people up to 325 lbs with forward tilt option",
        computedMetric: "147.4 kg"
      }
    ],
    recline: [
      {
        value: "Synchronized 3-point tilt; 5-position back stop from upright to reclined; optional 5° forward tilt",
        scope: "all / forward tilt optional",
        sourceUrl: "https://www.haworth.com/na/en/products/seating/office-chairs/fern-office-chair.html",
        sourceTitle: "Fern Office Chair (haworth.com NA)",
        checkedOn: "2026-09-26",
        quote: "Synchronized 3-point tilt enables comfortable, relaxed postures … 5-position back stop adjusts from upright to reclined"
      },
      {
        value: "Optional forward tilt 5°",
        scope: "option",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Optional Forward Tilt Angle the seat downward by 5° to support a forward-leaning posture."
      }
    ],
    arms: [
      {
        value: "Optional 4D arms (up/down, side to side, front/back, pivot); also fixed, height-adjustable, armless",
        scope: "option-dependent",
        sourceUrl: "https://www.haworth.com/na/en/products/seating/office-chairs/fern-office-chair.html",
        sourceTitle: "Fern Office Chair (haworth.com NA)",
        checkedOn: "2026-09-26",
        quote: "Fixed arms, height-adjustable arms, 4D arms, and armless options available"
      },
      {
        value: "4D arms description",
        scope: "4D option",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "4D arms adjust up and down, side to side, front to back, and pivot in and out to support your neck and shoulders."
      },
      {
        value: "Arm height 6.7–11.5 in (seat-relative); width between armrests 15.1–19.8 in",
        unit: "in",
        scope: "store (US)",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arm Height: 6.7\"-11.5\" Width Between Armrests: 15.1\"-19.8\""
      }
    ],
    lumbar: [
      {
        value: "Built-in lumbar support; optional height-adjustable lumbar (3.5 in range)",
        scope: "option",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Optional Height-Adjustable Lumbar Support … This option adds an additional adjustment that moves up and down in a 3.5\" range."
      }
    ],
    headrest: [
      {
        value: "Optional",
        scope: "store (US)",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "Without Headrest: Overall Height: 41.5\"-47\" With Headrest: Overall Height: 45\"-53\" … If your chair has a headrest, it installs in two easy steps."
      }
    ],
    warranty: [
      {
        value: "12 year warranty",
        scope: "store (US)",
        sourceUrl: "https://store.haworth.com/products/fern-office-chair",
        sourceTitle: "Fern Office Chair – Haworth Store (US)",
        checkedOn: "2026-09-26",
        quote: "12 year warranty"
      }
    ]
  },
  "steelcase-leap-v2": {
    officialName: "Leap (Leap 462 Series). Steelcase's current pages do not use the name 'V2'.",
    seatHeight: [
      {
        value: "15.5–20.5",
        unit: "in",
        scope: "standard work chair",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 15.5\" - 20.5\"",
        computedMetric: "39.4–52.1 cm"
      },
      {
        value: "15.5–20.5 standard; 17–24 with optional 7 in cylinder",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Range of adjustability is 5\", from 15½\"H to 20½\"H, and is standard on work chairs. A 7\" range of adjustability (17\"H to 24\"H) is available as an option."
      }
    ],
    seatDepth: [
      {
        value: "15.75–18.75 (functional, 3 in adjustment); seat depth 19",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat depth adjusts 3\" (15¾\"–18¾\") by pulling handle up.",
        computedMetric: "40–47.6 cm"
      }
    ],
    seatWidth: [
      {
        value: "19.25",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Seat width 19¼\"W: Leap",
        computedMetric: "48.9 cm"
      }
    ],
    backHeight: [
      {
        value: "25",
        unit: "in",
        scope: "work chair, back height from seat",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Back Height from Seat 25\" (Work Chairs)",
        computedMetric: "63.5 cm"
      }
    ],
    weightCapacity: [
      {
        value: "400",
        unit: "lb",
        scope: "chair (stool 300 lb; Leap Plus 500 lb)",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/leap/",
        sourceTitle: "Leap Ergonomic Office Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Leap chair is durable enough to handle weight up to 400 lbs. Leap stool is durable enough to handle weight up to 300 lbs.",
        computedMetric: "181.4 kg"
      },
      {
        value: "400",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Limit 400 lbs"
      }
    ],
    recline: [
      {
        value: "Full manual recline range with four recline angle settings and an upright back lock",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Full manual recline range with four recline angle settings and an upright back lock."
      },
      {
        value: "Variable back stop, five stops; seat-to-back angle 96°–120°",
        scope: "work chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Variable back stop. … Five stops are available. … Seat-to-back angle 96° to 120°: Leap"
      },
      {
        value: "Natural Glide System",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Natural Glide System™ Allows the seat to glide forward as the back reclines"
      }
    ],
    arms: [
      {
        value: "4D arms: height, width, depth, pivot (standard on store model); options height-adjustable, armless",
        scope: "option-dependent",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/leap/",
        sourceTitle: "Leap Ergonomic Office Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Standard 4-dimensional arm support adjusts to preferred height, width, depth and pivot."
      },
      {
        value: "Arm height 4 in range, depth 3 in, width 4.5 in overall, pivot 30°",
        scope: "fully adjustable arm",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Arm height can adjust independently within a 4\" range … Arm depth can retract 3\" … Arm width can adjust 4½\" overall … Arm caps can pivot 30° in and out"
      }
    ],
    lumbar: [
      {
        value: "LiveBack with height-adjustable lumbar (5 in) + lower back firmness",
        scope: "standard (may be omitted)",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Lumbar height adjusts 5\" (5¼\" to 10¼\" from seat) … This feature is standard on work chairs and stools, but may be omitted."
      }
    ],
    headrest: [
      {
        value: "Optional (+$340 list; not on stools or Leap Plus)",
        scope: "dealer/spec-guide configuration; NOT offered in Steelcase Store configurator",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Headrest (option) adjusts 2¼\" vertically and adds 6¾\" to 9\" to the overall height. … Headrest is not available on stools or Plus models."
      }
    ],
    warranty: [
      {
        value: "Steelcase Limited Lifetime warranty – 12 years, multi-shift, 24/7 parts and labor",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/leap/",
        sourceTitle: "Leap Ergonomic Office Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Both are backed by the Steelcase Limited Lifetime warranty – 12 years, multi-shift, 24/7 parts and labor."
      },
      {
        value: "Limited 12-year Warranty on parts and labor",
        scope: "Steelcase Store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Limited 12-year Warranty on parts and labor."
      }
    ],
    chairWeight: [
      {
        value: "46.7",
        unit: "lb",
        scope: "Leap chair",
        sourceUrl: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf",
        sourceTitle: "Understanding and Specifying Leap 462 Series Work Chairs – Seating Specification Guide, February 2024 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Product Weight • Leap chair: 46.7 pounds",
        computedMetric: "21.2 kg"
      },
      {
        value: "46.7",
        unit: "lb",
        scope: "store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap",
        sourceTitle: "Leap – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight 46.7 lbs"
      }
    ]
  }
}

export function getOfficialSpecs(slug?: string | null): OfficialSpecs | undefined {
  return slug ? officialSpecs[slug] : undefined
}
