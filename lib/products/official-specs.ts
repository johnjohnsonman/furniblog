/**
 * Official specifications for top compared chairs, keyed by product slug.
 *
 * Every value comes from a brand source (spec sheet, product page or official
 * store) with its URL, the date it was read and the exact quoted wording.
 * Fields with no official statement are left out rather than estimated.
 * Where sources disagree (e.g. Aeron seat height on the specs page vs the
 * store), each value is kept with its own scope. Field names mirror planned DB
 * columns (camelCase here, snake_case in the table), as in price-provenance.
 * `computedMetric` and `computedImperial` are conversions we calculated, not
 * official figures.
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
  /** Imperial conversion we calculated for a metric official value. */
  computedImperial?: string
  /** Kept for the record but not shown (reason). */
  displayExcluded?: string
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
      },
      {
        value: "Options:  Fixed Arms (modal title 'Stationary Arms'), Height-Adjustable Arms, Fully Adjustable Arms",
        scope: "Aeron store configurator",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "View this product in: Arms Fixed Arms … Height-Adjustable Arms … Fully Adjustable Arms"
      },
      {
        value: "Fully Adjustable Arms: height 6.8–10.8 in above seat, slide 2.5 in forward/back, pivot 15° out / 17.5° in",
        scope: "Fully Adjustable Arms",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Fully Adjustable Arms adjust from a height of 6.8 inches above the seat to 10.8 inches above the seat, slide backward and forward over a range of 2.5 inches, and pivot 15 degrees outward and 17.5 degrees inward."
      },
      {
        value: "Height-Adjustable Arms: 6.8–10.8 in above seat",
        scope: "Height-Adjustable Arms",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Height-Adjustable Arms adjust from a height of 6.8 inches above the seat to 10.8 inches above the seat."
      },
      {
        value: "Stationary Arms: A 7.8 in, B 8.5 in, C 8.5 in from seat",
        scope: "Stationary Arms",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arms are set at the following heights: A (Small Chair Size): 7.8\" from seat B (Medium Chair Size): 8.5\" from seat C (Large Chair Size): 8.5\" from seat"
      },
      {
        value: "Store product details summary: height, depth, and angle",
        scope: "store details bullet",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US",
        sourceTitle: "Aeron Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Fully adjustable arms (height, depth, and angle) allow for a custom fit."
      },
      {
        value: "Options:  Fully Adjustable Arms, Height-Adjustable Arms with Pivot, Height-Adjustable Arms, No Arms, Stationary Arms",
        scope: "hermanmiller.com specs",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Fully Adjustable Arms Highly adjustable to position arms where needed Height-Adjustable Arms with Pivot Adjust height and angle of arms Height-Adjustable Arms No Arms Stationary Arms"
      },
      {
        value: "Options:  'Fully adjustable arms plus arm pad depth'",
        scope: "product sheet",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf",
        sourceTitle: "Aeron Chairs product sheet (PDF, © 2026 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Arm options No arms Fixed arms Height-adjustable arms Fully adjustable arms Fully adjustable arms plus arm pad depth"
      },
      {
        value: "Arm Height 7.5–11.5 in (Fully Adjustable Arms, specs page)",
        unit: "in",
        scope: "hermanmiller.com specs",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/",
        sourceTitle: "Aeron Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Aeron Chair–A Size–Fully Adjustable Arms … Arm Height: 7.5\"–11.5\""
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
  },
  "herman-miller-mirra-2": {
    officialName: "Mirra 2 Chair (Herman Miller; work chair with Butterfly Back or TriFlex Back)",
    sizes: [
      {
        value: "One size; two back options: TriFlex Polymer Back, Butterfly Suspension Back",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Family Work Chair with Butterfly Back Work Chair with TriFlex Back Stool with Butterfly Back Stool with TriFlex Back"
      }
    ],
    seatHeight: [
      {
        value: "16–20.5 standard; 14.75–19 low; 16.75–22.25 extended",
        unit: "in",
        scope: "work chair, by cylinder",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Low-Height Range 14.75\"–19\" Standard-Height Range 16\"–20.5\" Extended-Height Range 16.75\"–22.25\"",
        computedMetric: "40.6–52.1 cm standard (37.5–48.3 low; 42.5–56.5 extended)"
      },
      {
        value: "14.8–22.2",
        unit: "in",
        scope: "all configurations (overall span across cylinders)",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/",
        sourceTitle: "Mirra 2 Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Mirra 2 Chair–Polymer Back–Adjustable Arms … Seat Height: 14.8\"–22.2\"",
        computedMetric: "37.6–56.4 cm"
      },
      {
        value: "16–20.5",
        unit: "in",
        scope: "store configuration (US)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Min (in): 16 Seat Height Max (in): 20½",
        computedMetric: "40.6–52.1 cm"
      }
    ],
    seatDepth: [
      {
        value: "16.25 fixed; 16.25–18 FlexFront adjustable",
        unit: "in",
        scope: "option-dependent",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth is fixed at a standard 16.25\" … FlexFront Adjustable: Seat edge adjusts from a depth of 16.25\" to 18\"",
        computedMetric: "41.3 cm fixed; 41.3–45.7 cm adjustable"
      },
      {
        value: "16.25 fixed; 16.25–18 adjustable",
        unit: "in",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth Fixed Seat 16.25\" Adjustable Seat 16.25\"–18\""
      },
      {
        value: "16.2–18",
        unit: "in",
        scope: "all configurations",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/",
        sourceTitle: "Mirra 2 Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth: 16.2\"–18\"",
        computedMetric: "41.1–45.7 cm"
      }
    ],
    weightCapacity: [
      {
        value: "350",
        unit: "lb",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Maximum User Weight 350 lbs/159 kg",
        computedMetric: "159 kg (official)"
      },
      {
        value: "350",
        unit: "lb",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Capacity (lbs): 350 … The Mirra 2 Chair supports users up to 350 pounds.",
        computedMetric: "158.8 kg"
      }
    ],
    recline: [
      {
        value: "Harmonic 2 Tilt; options: Standard Tilt, Tilt Limiter, Tilt Limiter with Seat Angle",
        scope: "option-dependent",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Tilt Options Standard Tilt Tilt Limiter Tilt Limiter with Seat Angle"
      },
      {
        value: "Basic Tilt: tension knob, recline 124°, no locking mechanism",
        scope: "Basic (Standard) Tilt option",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "The Basic Tilt comes with a tilt tension knob that allows you to adjust the amount of tension needed to recline (124 degrees) comfortably while feeling balanced and supported. The Basic Tilt does not have a locking mechanism."
      },
      {
        value: "Tilt Limiter: three settings (92°, 100°, 124°); Seat Angle: 5° forward tilt",
        scope: "Tilt Limiter / Tilt Limiter and Seat Angle options",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "The Tilt Limiter lets you limit the recline range to one of three settings (92, 100, or 124 degrees). … The Seat Angle Adjustment changes the angle of the seat from horizontal to a 5-degree forward tilt"
      }
    ],
    arms: [
      {
        value: "Options: No Arms, Fixed Arms, Fully Adjustable 4D Arms",
        scope: "option-dependent (product sheet wording)",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Arm Options No Arms Fixed Arms Fully Adjustable 4D Arms"
      },
      {
        value: "Adjustable Arms: 4-way adjustable armpads – 5.5 in vertical (6–11.5 in above seat), 1.125 in horizontal, 2 in front to back, pivot 20° out / 20° in",
        scope: "Adjustable Arms option (store wording)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Adjustable Arms feature 4-way adjustable armpads that can be adjusted 5.5\" vertically (6\" to 11.5\" from the seat to the top of the armpad), 1.125\" horizontally, and 2\" front to back, and that can pivot the armpads 20 degrees outward and 20 degrees inward."
      },
      {
        value: "Fixed Arms: 6 in above seat",
        scope: "Fixed Arms option (store)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arms are set at 6\" above the seat and cannot be adjusted."
      },
      {
        value: "Arm height 6–11.5 in (adjustable); 8.3 in (fixed)",
        unit: "in",
        scope: "hermanmiller.com specs",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/",
        sourceTitle: "Mirra 2 Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "Adjustable Arms … Arm Height: 6\"–11.5\" | Fixed Arms … Arm Height: 8.3\""
      }
    ],
    lumbar: [
      {
        value: "PostureFit sacral support standard; Adjustable Lumbar Support optional (4.5 in height, 1 in depth)",
        scope: "option-dependent",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "The Adjustable Lumbar support offers a range of 4.5\" in height adjustability an 1\" in depth adjustability. In addition, there is a built in PostureFit, which properly supports the base of your spine"
      },
      {
        value: "PostureFit Sacral-Support Standard; Adjustable Lumbar-Support Optional",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Back Support PostureFit Sacral-Support Standard Adjustable Lumbar-Support Optional"
      }
    ],
    warranty: [
      {
        value: "12-year, 3-shift warranty, with limited exceptions",
        scope: "all",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/",
        sourceTitle: "Mirra 2 Chair – Specs (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "We stand behind the quality and performance of our products with a 12-year, 3-shift warranty, with limited exceptions."
      },
      {
        value: "12 years",
        scope: "product sheet",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/Mirra_2_product_sheet.pdf",
        sourceTitle: "Mirra 2 Chair product sheet (PDF, © 2024 MillerKnoll)",
        checkedOn: "2026-09-26",
        quote: "Warranty … 12 years"
      },
      {
        value: "12-year warranty (terms and conditions apply)",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "12-year warranty Terms and conditions apply."
      }
    ],
    chairWeight: [
      {
        value: "52",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html?lang=en_US",
        sourceTitle: "Mirra 2 Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Product Weight 52 lbs",
        computedMetric: "23.6 kg"
      }
    ]
  },
  "humanscale-liberty": {
    officialName: "Liberty Task Chair (Humanscale; designed by Niels Diffrient). Sibling: Liberty Ocean.",
    seatHeight: [
      {
        value: "16.6–20.9",
        unit: "in",
        scope: "US shop configuration (standard cylinder)",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 16.6 in - 20.9 in",
        computedMetric: "42.2–53.1 cm"
      },
      {
        value: "16.6–20.9 standard cylinder; 15.4–18.4 low; 17.25–22.6 tall; high/extra-high cylinders up to 34.0",
        unit: "in",
        scope: "by cylinder (Feb 2020 guide)",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "16.6\" - 20. 9\" standard cylinder chair 15.4\" - 18.4\" low-cylinder chair 17.25\" - 22.6\" tall-cylinder chair 21.1\" - 28.6\" high-cylinder chair 24.0\" - 34.0\" extra high-cylinder chair",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      },
      {
        value: "16.5–34.2",
        unit: "in",
        scope: "configurator TECH SPECS (spans all cylinder options)",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Range: 16.5\" – 34.2\"",
        displayExcluded: "Range includes stool-height cylinders"
      }
    ],
    seatDepth: [
      {
        value: "16.5–18.75",
        unit: "in",
        scope: "US shop",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth 16.5 in - 18.75 in",
        computedMetric: "41.9–47.6 cm"
      },
      {
        value: "16.5–18.75 (from face of lumbar to front of seat)",
        unit: "in",
        scope: "Feb 2020 guide",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "seat depth (from face of lumbar to front of seat) 16.5\" – 18.75\"",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      }
    ],
    seatWidth: [
      {
        value: "21.25",
        unit: "in",
        scope: "Feb 2020 guide (layout-extracted)",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "c seat width … 21.25\"",
        computedMetric: "54 cm",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      }
    ],
    backHeight: [
      {
        value: "23",
        unit: "in",
        scope: "US shop",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Backrest Height 23 in.",
        computedMetric: "58.4 cm"
      },
      {
        value: "23 (from seat cushion to top of backrest)",
        unit: "in",
        scope: "Feb 2020 guide",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "backrest height (from seat cushion to top of backrest) 23\"",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      }
    ],
    weightCapacity: [
      {
        value: "400",
        unit: "lb",
        scope: "US shop",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Capacity 400 lb",
        computedMetric: "181.4 kg"
      },
      {
        value: "up to 400",
        unit: "lb",
        scope: "configurator",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Weight Capacity: up to 400 lbs"
      },
      {
        value: "Certified to 400",
        unit: "lb",
        scope: "product page",
        sourceUrl: "https://www.humanscale.com/products/seating/liberty-task-office-chair",
        sourceTitle: "Liberty Task (humanscale.com, US)",
        checkedOn: "2026-09-26",
        quote: "Certified To 400lbs"
      },
      {
        value: "100–300 (scope of users, 2020)",
        unit: "lb",
        scope: "Feb 2020 guide",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Conference/Task chair fits more than 95% of the office population … 100 to 300 lbs.",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      }
    ],
    recline: [
      {
        value: "Weight-sensitive recline; no manual adjustments or tension controls",
        scope: "US shop",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Weight-sensitive recline responds naturally to your body without manual adjustments or tension controls."
      },
      {
        value: "18° recline + 8° backrest tilt",
        scope: "configurator TECH SPECS",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Recline Range: 18° recline + 8° backrest tilt"
      },
      {
        value: "Self-Adjusting Recline: no tension springs, no recline locks",
        scope: "brochure",
        sourceUrl: "https://humanscale.getbynder.com/m/2e928633743e1ef7/original/hs-seating-liberty-brochure.pdf",
        sourceTitle: "Liberty brochure (PDF, Humanscale, undated)",
        checkedOn: "2026-09-26",
        quote: "Intelligent counter-balance recline mechanism automatically provides the right amount of support through the full range of recline motion, regardless of user size and weight · No tension springs to adjust · No recline locks to set/release"
      }
    ],
    arms: [
      {
        value: "Options: Fixed Duron Arms, Adjustable Duron Arms, Advanced Duron Arms, Armless, Fixed Duron Gel Arms",
        scope: "configurator (US)",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Armrest/Armpad Fixed Duron Arms (6) … Adjustable Duron Arms (3) … Advanced Duron Arms (E) … Armless (0) Fixed Duron Gel Arms (X)"
      },
      {
        value: "Arms attached to the backrest, move with you as you recline",
        scope: "all armed versions",
        sourceUrl: "https://www.humanscale.com/products/seating/liberty-task-office-chair",
        sourceTitle: "Liberty Task (humanscale.com, US)",
        checkedOn: "2026-09-26",
        quote: "Just like the human body, Liberty's arms are attached to its back, so they move with you as you recline."
      },
      {
        value: "Height-adjustable armrests with 5 in range; armrest height 6.25–9.75 in adjustable / 10 in fixed",
        scope: "Feb 2020 guide",
        sourceUrl: "https://www.humanscale.com/userfiles/file/US_priceguide_FEB2020.pdf",
        sourceTitle: "Humanscale Pricing and Specification Guide, US, Feb 2020 (PDF)",
        checkedOn: "2026-09-26",
        quote: "Height-adjustable armrests with 5\" range of adjustment … armrest height (from compressed seat cushion to top of armrest) 10\" fixed 6.25\"-9.75\" adjustable",
        displayExcluded: "Superseded by current Humanscale pages (Feb 2020 guide)"
      }
    ],
    lumbar: [
      {
        value: "Built-in lumbar support via Form Sensing Mesh (no adjustable lumbar device)",
        scope: "all",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Built-in lumbar support Unlike traditional single-panel mesh, Liberty's Form Sensing Mesh takes on the exact shape of the sitter's back"
      },
      {
        value: "Self-adjusting lumbar support; no external lumbar devices",
        scope: "brochure",
        sourceUrl: "https://humanscale.getbynder.com/m/2e928633743e1ef7/original/hs-seating-liberty-brochure.pdf",
        sourceTitle: "Liberty brochure (PDF, Humanscale, undated)",
        checkedOn: "2026-09-26",
        quote: "Tri-panel, non-stretch mesh construction creates body-fitting contours and self-adjusting lumbar support for a customized fit · No external lumbar devices to adjust, break or lose"
      }
    ],
    warranty: [
      {
        value: "15 Years; Fabric/Cushions/Arm Pads/Casters: 5 Years",
        scope: "US shop",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Warranty 15 Years; Fabric/Cushions/Arm Pads/Casters: 5 Years"
      },
      {
        value: "15-year, 24/7 warranty",
        scope: "configurator",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Liberty is yours with a 15-year, 24/7 warranty."
      }
    ],
    chairWeight: [
      {
        value: "34",
        unit: "lb",
        scope: "US shop configuration (with arms)",
        sourceUrl: "https://shop.humanscale.com/products/liberty-task-chair",
        sourceTitle: "Liberty Task Chair with Mesh Backrest – Humanscale Shop (US)",
        checkedOn: "2026-09-26",
        quote: "Overall Weight 34 lb",
        computedMetric: "15.4 kg"
      },
      {
        value: "34 with arms / 30 armless",
        unit: "lb",
        scope: "configurator",
        sourceUrl: "https://www.humanscale.com/products/liberty-task-chair-configurator.cfm",
        sourceTitle: "Liberty Task Chair configurator (humanscale.com, US region)",
        checkedOn: "2026-09-26",
        quote: "Chair Weight: 34 lbs arms / 30 lbs armless"
      }
    ]
  },
  "herman-miller-sayl": {
    officialName: "Sayl Chair (Herman Miller; work chair with suspension back, or upholstered mid/high back)",
    seatHeight: [
      {
        value: "16–20.5 standard; 15–19 low; 16.5–22 extended",
        unit: "in",
        scope: "work chair, by cylinder",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Low-Height Range 15\"–19\" Standard-Height Range 16\"–20.5\" Extended-Height Range 16.5\"–22\"",
        computedMetric: "40.6–52.1 cm standard"
      },
      {
        value: "16–20.5",
        unit: "in",
        scope: "store configuration (US)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Min (in): 16 Seat Height Max (in): 20½",
        computedMetric: "40.6–52.1 cm"
      }
    ],
    seatDepth: [
      {
        value: "16 fixed; 16–18 adjustable",
        unit: "in",
        scope: "store (option-dependent)",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth is fixed at 16\" and cannot be adjusted. … Allows you to adjust the seat depth from 16\" to 18\".",
        computedMetric: "40.6 cm fixed; 40.6–45.7 cm adjustable"
      },
      {
        value: "16.5 fixed; 16–18 adjustable",
        unit: "in",
        scope: "product sheet",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth Fixed Seat 16.5\" Adjustable Seat 16\"–18\""
      }
    ],
    seatWidth: [
      {
        value: "18",
        unit: "in",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Width (in): 18",
        computedMetric: "45.7 cm"
      }
    ],
    weightCapacity: [
      {
        value: "350",
        unit: "lb",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Maximum User Weight 350 lbs/159 kg",
        computedMetric: "159 kg (official)"
      },
      {
        value: "350",
        unit: "lb",
        scope: "all configurations",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "The Herman Miller Sayl Chair has a weight capacity of 350 pounds, which applies across all configuration options."
      },
      {
        value: "350",
        unit: "lb",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/product-details/",
        sourceTitle: "Sayl Chairs – Product Details (hermanmiller.com)",
        checkedOn: "2026-09-26",
        quote: "provide ergonomic support for people up to 350 pounds (159 kg)."
      }
    ],
    recline: [
      {
        value: "Harmonic Tilt; Tilt Limiter standard, Tilt Limiter with Seat Angle optional",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Harmonic™ Tilt Sayl's Harmonic Tilt enables natural, balanced movement through a range of postures. … Tilt Options Tilt Limiter Standard Tilt Limiter with Seat Angle Optional"
      },
      {
        value: "Forward tilt only on some models",
        scope: "adjustment guide",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/user_information/sayl_chairs_adjustment_guide.pdf",
        sourceTitle: "Sayl Chair Adjustment Guide (PDF)",
        checkedOn: "2026-09-26",
        quote: "Forward Tilt: Front horizontal tab on left side of seat Only available on some models."
      }
    ],
    arms: [
      {
        value: "Options: No Arms, Fixed Arms, Height Adjustable Arms, Fully Adjustable 4D Arms",
        scope: "product sheet wording",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Arm Options No Arms Fixed Arms Height Adjustable Arms Fully Adjustable 4D Arms"
      },
      {
        value: "Fully Adjustable Arms: 4-way adjustable armpads – 4 in vertical (6.7–10.8 in above seat), 1.38 in horizontal, 2 in front to back, pivot 11° out / 11° in",
        scope: "store 'Fully Adjustable Arms' option",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Adjustable Arms feature 4-way adjustable armpads that can be adjusted 4\" vertically (6.7\" to 10.8\" from the seat to the top of the armpad), 1.38\" horizontally, and 2\" front to back, and that can pivot the armpads 11 degrees outward and 11 degrees inward."
      },
      {
        value: "Height-Adjustable Arms: 6.7–10.8 in above seat; Fixed Arm: 9.4 in",
        scope: "store options",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Height-Adjustable Arms provide an arm height range of 6.7\" to 10.8\" from the seat. … Arms are set at 9.4\" above the seat and cannot be adjusted."
      }
    ],
    lumbar: [
      {
        value: "Built-in passive PostureFit; optional Adjustable Lumbar Support (4 in vertical)",
        scope: "option-dependent",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Adjusts vertically over a 4\" span to support the natural curve of your midback, or lumbar region."
      },
      {
        value: "PostureFit Sacral Support Standard; Lumbar Support Optional",
        scope: "work chair",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Back Support PostureFit Sacral Support Standard Lumbar Support Optional"
      }
    ],
    warranty: [
      {
        value: "12-year, 3-shift",
        scope: "product sheet",
        sourceUrl: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/sayl_chairs_product_sheet.pdf",
        sourceTitle: "Sayl Chairs product sheet (PDF, © 2019 Herman Miller)",
        checkedOn: "2026-09-26",
        quote: "Warranty 12-year, 3-shift"
      },
      {
        value: "12-year warranty (terms and conditions apply)",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "12-year warranty Terms and conditions apply."
      }
    ],
    chairWeight: [
      {
        value: "54",
        unit: "lb",
        scope: "store configuration",
        sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html?lang=en_US",
        sourceTitle: "Sayl Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Product Weight 54 lbs",
        computedMetric: "24.5 kg"
      }
    ]
  },
  "steelcase-karman": {
    officialName: "Steelcase Karman (standard back chair; high back chair with neck support pillow; stool)",
    sizes: [
      {
        value: "Standard back chair, standard back stool, or high back chair with neck support pillow",
        scope: "steelcase.com options",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "STEELCASE KARMAN OPTIONS: Standard back chair, standard back stool, or high back chair with neck support pillow"
      }
    ],
    seatHeight: [
      {
        value: "15.8125–20.4375",
        unit: "in",
        scope: "Steelcase Store configuration",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 15.8125\" - 20.4375\"",
        computedMetric: "40.2–51.9 cm"
      },
      {
        value: "15.625–20",
        unit: "in",
        scope: "steelcase.com Chair and High Back Chair",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Seat Height 15.625\"-20\"",
        computedMetric: "39.7–50.8 cm"
      }
    ],
    seatDepth: [
      {
        value: "Fixed seat depth (no number given)",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Steelcase Karman was designed with a fixed seat depth"
      }
    ],
    weightCapacity: [
      {
        value: "350",
        unit: "lb",
        scope: "Steelcase Store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Limit 350 lbs",
        computedMetric: "158.8 kg"
      }
    ],
    recline: [
      {
        value: "Weight-activated mechanism; Comfort Dial with four recline positions (full recline, full recline with more tension, mid-stop, upright lock)",
        scope: "all",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "The comfort dial supports four recline positions: Weight-activated full recline. Weight-activated full recline with tension that has more resistance than your body is providing. Mid-stop recline setting. Upright lock setting."
      },
      {
        value: "Comfort dial supports four recline positions",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "The comfort dial supports four recline positions, letting you dial in the right level of resistance against your back as you recline."
      }
    ],
    arms: [
      {
        value: "4D arms or armless",
        scope: "steelcase.com options",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "4D arms or armless"
      },
      {
        value: "4D ARM: raise up and down, pivot in and out, shift in all directions",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Fully adjustable armrests raise up and down, pivot in and out and shift in all directions, letting your arms and shoulders fall naturally into place."
      },
      {
        value: "Four-way arms: height, width, depth, pivot",
        scope: "Steelcase Store FAQ",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Four-way arms adjust for height, width, depth and pivot."
      }
    ],
    lumbar: [
      {
        value: "Built-in lumbar support in every chair; optional (height-adjustable) lumbar",
        scope: "option-dependent",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Karman includes built-in lumbar support in every chair. An optional lumbar support is available to provide additional support to your lower back."
      },
      {
        value: "Optional lumbar support",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Optional lumbar support allows you to customize the support for your lumbar region."
      }
    ],
    headrest: [
      {
        value: "No headrest option; High Back version has an adjustable neck support pillow",
        scope: "store FAQ vs steelcase.com High Back",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "No, at this time we are not offering a Steelcase Karman headrest option."
      }
    ],
    warranty: [
      {
        value: "Steelcase Limited Lifetime Warranty",
        scope: "steelcase.com",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Steelcase Karman is backed by the Steelcase Limited Lifetime Warranty."
      },
      {
        value: "Limited 12-year Warranty on parts and labor",
        scope: "Steelcase Store",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Limited 12-year Warranty on parts and labor."
      }
    ],
    chairWeight: [
      {
        value: "29",
        unit: "lb",
        scope: "standard back chair",
        sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman",
        sourceTitle: "Steelcase Karman – Steelcase Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight 29 lbs",
        computedMetric: "13.2 kg"
      },
      {
        value: "29",
        unit: "lb",
        scope: "Chair (steelcase.com)",
        sourceUrl: "https://www.steelcase.com/products/office-chairs/steelcase-karman/",
        sourceTitle: "Steelcase Karman Mesh Ergonomic Office & Desk Chair (steelcase.com)",
        checkedOn: "2026-09-26",
        quote: "Product Weight 29 lbs"
      }
    ]
  },
  "herman-miller-embody-gaming": {
    officialName: "Embody Gaming Chair (Herman Miller x Logitech G)",
    seatHeight: [
      {
        value: "16–20.5",
        unit: "in",
        scope: "store (US)",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Height Min (in): 16 Seat Height Max (in): 20½",
        computedMetric: "40.6–52.1 cm"
      }
    ],
    seatDepth: [
      {
        value: "15–18",
        unit: "in",
        scope: "store (US)",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Seat Depth Min (in): 15 Seat Depth Max (in): 18",
        computedMetric: "38.1–45.7 cm"
      }
    ],
    weightCapacity: [
      {
        value: "300",
        unit: "lb",
        scope: "store (US)",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Weight Capacity (lbs): 300 … The weight limit for the Embody Gaming Chair is 300 pounds.",
        computedMetric: "136.1 kg"
      }
    ],
    recline: [
      {
        value: "Tilt limiter to set desired recline angle; tilt tension knob",
        scope: "all",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Yes, the Embody Gaming Chair has a tilt limiter that enables the sitter to define and set their desired angle of recline."
      },
      {
        value: "Tilt Limiter / Tilt Tension",
        scope: "adjustment guide",
        sourceUrl: "https://library.hermanmiller.group/m/fec41f0bd6d4b35/original/Herman-Miller-X-Logitech-G-Embody-Gaming-Chair-adjustment-guide.pdf",
        sourceTitle: "Herman Miller x Logitech G Embody Gaming Chair Adjustment Guide (PDF)",
        checkedOn: "2026-09-26",
        quote: "TILT LIMITER: Back horizontal tab on left side behind seat … Recline and move tab up to define the limit of recline."
      }
    ],
    arms: [
      {
        value: "Fully Adjustable Arms (only arm option in store)",
        scope: "store configurator",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arms … Fully Adjustable Arms"
      },
      {
        value: "Arm height and width adjustable",
        scope: "store product details",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arm height and width are adjustable for customized comfort."
      },
      {
        value: "Arm Height, Width, and Depth",
        scope: "store adjustments page",
        sourceUrl: "https://store.hermanmiller.com/gaming-chair-adjustments?lang=en_US",
        sourceTitle: "Gaming Chair Adjustments – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Arm Height, Width, and Depth Raise or lower the arms by pushing the button on the underside of each arm pad. To match the arm pads to the width of your shoulders, pull each of them inward or outward. Then, while still grasping the front end, slide it forward or back to adjust arm pad depth."
      }
    ],
    lumbar: [
      {
        value: "No separate lumbar device: PostureFit spinal support + BackFit adjustment",
        scope: "all",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "our patented PostureFit device is here to mimic that strong, standing position by supporting your spine at its lowest point, the sacrum, while also providing lumbar support. … It adjusts to your spine's unique shape"
      }
    ],
    warranty: [
      {
        value: "12-year warranty (terms and conditions apply)",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "12-year warranty Terms and conditions apply."
      }
    ],
    chairWeight: [
      {
        value: "51.75",
        unit: "lb",
        scope: "store",
        sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US",
        sourceTitle: "Embody Gaming Chair – Herman Miller Store (US)",
        checkedOn: "2026-09-26",
        quote: "Product Weight 51.75 lbs",
        computedMetric: "23.5 kg"
      }
    ]
  },
  "anthros-chair": {
    officialName: "Anthros Chair (Anthros Office; 'Anthros Custom' configurable, 'Anthros Black' fixed configuration)",
    sizes: [
      {
        value: "One size (\"one-size-adjusts-all\"); base option: Swivel 5 Spoke or Fixed 4 Spoke (non-swivel)",
        scope: "all",
        sourceUrl: "https://faq.anthros.com/en/articles/7031562-am-i-too-tall-short-for-this-chair",
        sourceTitle: "Anthros Help Center – Am I too tall/short for this chair?",
        checkedOn: "2026-09-26",
        quote: "The Anthros is a one-size-adjusts-all design."
      }
    ],
    seatHeight: [
      {
        value: "17.1–20.7 in (5-spoke swivel base); 17.9–21.1 in (4-spoke fixed base)",
        unit: "in",
        scope: "Industry Standard Seat Height (weighted measuring device), by base",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "J Industry Standard Seat Height* 4 Spoke: 17.9 - 21.1\" (45.5 - 53.7 cm) 5 Spoke: 17.1 - 20.7\" (43.5 - 52.5 cm) … * Seat height to floor measured using industry-standard, and weighted, chair measurement device.",
        computedMetric: "43.5–52.5 cm (5 Spoke); 45.5–53.7 cm (4 Spoke) (official cm)"
      },
      {
        value: "18.5–22.1 (5 Spoke); 19.3–22.5 (4 Spoke)",
        unit: "in",
        scope: "Seat to Floor Height, non-weighted, front of seat (not industry standard)",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "K Seat to Floor Height** 4 Spoke: 19.3 - 22.5\" (49 - 57.2 cm) 5 Spoke: 18.5 - 22.1\" (47 - 56.1 cm) … ** Non-weighted, and non-standard, measurement taken from the front of the seat to floor.",
        displayExcluded: "non-standard (unweighted, seat-front) measurement; show the Industry Standard value instead"
      },
      {
        value: "17.1–20.7 (5 Spoke); 17.9–21.1 (4 Spoke)",
        unit: "in",
        scope: "dimensions web page (2023 version)",
        sourceUrl: "https://anthros.com/anthros-chair-dimensions",
        sourceTitle: "Anthros Chair Dimensions (anthros.com; page footer V2.0_12122023)",
        checkedOn: "2026-09-26",
        quote: "Industry Standard Seat Height* 4 Spoke: 17.9 - 21.1” (45.5 - 53.7 cm) 5 Spoke: 17.1 - 20.7” (43.5 - 52.5 cm)"
      },
      {
        value: "17–20.6",
        unit: "in",
        scope: "help center (no base specified)",
        sourceUrl: "https://faq.anthros.com/en/articles/7031562-am-i-too-tall-short-for-this-chair",
        sourceTitle: "Anthros Help Center – Am I too tall/short for this chair?",
        checkedOn: "2026-09-26",
        quote: "The Anthros is designed to fit most adults, with a seat height range of 17\" to 20.6\".",
        computedMetric: "43.2–52.3 cm",
        displayExcluded: "rounded/unscoped; conflicts slightly with manual 17.1–20.7 (5 Spoke)"
      }
    ],
    seatDepth: [
      {
        value: "15.2–18.3",
        unit: "in",
        scope: "effective seat depth (set by moving the lower back pad; no seat slider)",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "H Seat Depth: 15.2\" - 18.3\" (38.7 - 46.6 cm)",
        computedMetric: "38.7–46.6 cm (official cm)"
      },
      {
        value: "No seat slider; depth set by low back pad",
        scope: "help center",
        sourceUrl: "https://faq.anthros.com/en/articles/8474233-does-anthros-have-a-seat-slider-refers-to-seat-depth",
        sourceTitle: "Anthros Help Center – Does Anthros have a seat slider?",
        checkedOn: "2026-09-26",
        quote: "We don’t have a seat slider. Instead, we use the low back pad to determine depth adjustment."
      }
    ],
    seatWidth: [
      {
        value: "21.2",
        unit: "in",
        scope: "user manual v7.0 (Dec 2025)",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "F Seat Width: 21.2\" (53.8 cm)",
        computedMetric: "53.8 cm (official)"
      },
      {
        value: "19.8",
        unit: "in",
        scope: "dimensions web page (2023 version)",
        sourceUrl: "https://anthros.com/anthros-chair-dimensions",
        sourceTitle: "Anthros Chair Dimensions (anthros.com; page footer V2.0_12122023)",
        checkedOn: "2026-09-26",
        quote: "Seat Width: 19.8” (50.3 cm)",
        displayExcluded: "superseded by user manual v7.0 (12/03/2025) value 21.2 in"
      }
    ],
    backHeight: [
      {
        value: "Upper back pad 14.2 in high × 15.2 in wide; lower back pad 5.8 in high × 17.3 in wide",
        unit: "in",
        scope: "two-part back (pad dimensions, not overall backrest height)",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "A Upper Back Height: 14.2\" (50 cm) B Upper Back Width: 15.2\" (38.6 cm) C Lower Back Height: 5.8\" (14.7 cm) D Lower Back Width: 17.3\" (43.9 cm)",
        computedMetric: "upper 36.1 cm high (brand prints '50 cm'); lower 14.7 cm high",
        displayExcluded: "Back pad dimensions, not backrest height; the manual's inch and cm figures do not match"
      },
      {
        value: "Upper back 12 in; lower back 5 in",
        unit: "in",
        scope: "dimensions web page (2023 version)",
        sourceUrl: "https://anthros.com/anthros-chair-dimensions",
        sourceTitle: "Anthros Chair Dimensions (anthros.com; page footer V2.0_12122023)",
        checkedOn: "2026-09-26",
        quote: "Upper Back Height: 12” (55.9 cm) … Lower Back Height: 5” (17.8 cm)",
        displayExcluded: "superseded by manual v7.0; inch/cm mismatch on the page"
      }
    ],
    weightCapacity: [
      {
        value: "300",
        unit: "lb",
        scope: "all",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "This chair has been tested and approved for users weighing up to 300 lbs (136kg).",
        computedMetric: "136 kg (official)"
      },
      {
        value: "300",
        unit: "lb",
        scope: "help center",
        sourceUrl: "https://faq.anthros.com/en/articles/7031540-do-i-weigh-too-much-for-this",
        sourceTitle: "Anthros Help Center – Do I weigh too much for this?",
        checkedOn: "2026-09-26",
        quote: "The Anthros has a weight capacity of 300 lbs. … The chair is independently tested by BIFMA … to meet or exceed 300 lbs",
        computedMetric: "136.1 kg"
      },
      {
        value: "300",
        unit: "lb",
        scope: "dimensions page",
        sourceUrl: "https://anthros.com/anthros-chair-dimensions",
        sourceTitle: "Anthros Chair Dimensions (anthros.com; page footer V2.0_12122023)",
        checkedOn: "2026-09-26",
        quote: "Weight capacity 300lbs"
      },
      {
        value: "Tilt spring: Light (under 140 lb) or Standard (140–300 lb)",
        scope: "tilt spring choice (affects tilt feel, not capacity)",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "The light spring chair has been tested and approved for users weighing up to 140 lbs (63kg). The standard spring chair has been tested and approved for users weighing 140-300 lbs (63-136 kg).",
        displayExcluded: "spring option, not a capacity figure"
      }
    ],
    recline: [
      {
        value: "Decompress Mode tilt: 0°–16°; five tilt options – three locked positions (Active −2°, Standard 1°, Decompress 5°) and two unlocked (Free-Float, Full Decompress to 16°)",
        scope: "all",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "Locked Positions Active Mode -2° Standard Mode* 1° Decompress Mode 5° … Unlocked Positions Free-Float Decompress Mode … Full Decompress Mode: Leave tilt unlocked and loosen tension until you can fully tilt to 16°. … L Tilt Angle: 0° - 16°"
      },
      {
        value: "Five posture-preserving tilt options: three locked, two unlocked",
        scope: "features page",
        sourceUrl: "https://anthros.com/features",
        sourceTitle: "Features (anthros.com)",
        checkedOn: "2026-09-26",
        quote: "Five posture-preserving tilt options to match how you sit, work, and recharge. With three locked positions for stable support and two unlocked positions that let the chair move naturally with your body"
      }
    ],
    arms: [
      {
        value: "4D Arms (option) or No Arms; the arms adjust in height, width, depth and angle",
        scope: "configurator + manual",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "Arm Adjustment … They can also be adjusted in height, width, depth, and angle."
      },
      {
        value: "Arm height 7.7–11.8 in; arm width (outside) 24.75–27 in",
        unit: "in",
        scope: "user manual v7.0",
        sourceUrl: "https://anthros.com/assets/files/UserManual_v7.0_12032025.pdf",
        sourceTitle: "Anthros User Manual v7.0 (PDF, 12/03/2025)",
        checkedOn: "2026-09-26",
        quote: "E Arm Width: 24.75\" - 27\" (62.9 - 68.6 cm) … I Arm Height: 7.7\" - 11.8\" (19.5 - 30 cm)",
        computedMetric: "arm height 19.5–30 cm (official)"
      },
      {
        value: "Fully 4D adjustable: forward/back, in/out, up/down, angle; height 7.4–11.5 in from seat; removable",
        scope: "help center",
        sourceUrl: "https://faq.anthros.com/en/articles/7031560-do-you-have-armrests",
        sourceTitle: "Anthros Help Center – Do you have armrests?",
        checkedOn: "2026-09-26",
        quote: "Yes! Anthros arms are fully 4D adjustable. … Move them forward/back, in/out, up/down, and angle in/out … Height range: 7.4\" to 11.5\" from the seat surface"
      }
    ],
    lumbar: [
      {
        value: "Precision Posture System: independently adjustable Upper Back + Lower Back Pelvis Support (no conventional lumbar pad)",
        scope: "all",
        sourceUrl: "https://anthros.com/features",
        sourceTitle: "Features (anthros.com)",
        checkedOn: "2026-09-26",
        quote: "Anthros has designed an adjustable 2-part back system that can support most individual body types. The low back pelvis support works with the upper back to promote an upright posture … When you support the pelvis, the lumbar region is naturally supported with it"
      }
    ],
    headrest: [
      {
        value: "No headrest / head support",
        scope: "all",
        sourceUrl: "https://faq.anthros.com/en/articles/10113219-why-does-anthros-not-include-a-head-support",
        sourceTitle: "Anthros Help Center – Why does Anthros not include a head support?",
        checkedOn: "2026-09-26",
        quote: "Anthros is built for active, upright sitting. Headrests are designed for a different kind of sitting entirely. … Are you working on a headrest option? Yes — we're exploring accessories"
      }
    ],
    warranty: [
      {
        value: "12-year limited warranty (components and workmanship, from date of purchase; original purchaser; non-transferable)",
        scope: "all",
        sourceUrl: "https://anthros.com/warranty",
        sourceTitle: "Anthros Warranty Page (anthros.com)",
        checkedOn: "2026-09-26",
        quote: "We warrant that every component on your chair, and the workmanship performed to build your chair, will be free from defects in materials and workmanship for a period of 12 years from your date of purchase."
      },
      {
        value: "12-year warranty, bumper to bumper",
        scope: "store FAQ",
        sourceUrl: "https://configurator.anthros.com/products/chair",
        sourceTitle: "Customize Your Anthros Chair – official configurator/store",
        checkedOn: "2026-09-26",
        quote: "We offer a 12-year warranty, bumper to bumper."
      }
    ]
  },
  "haworth-zody-ii": {
    officialName: "Zody II (Haworth; designed by ITO Design and Haworth Design Studio). Sold in EMEA and Asia Pacific as 'Zody II'. The US Haworth Store sells 'Zody Office Chair' (dual posture, PAL, 4D arms) without the 'II' name; the North America 'zody-ii' URL returns an empty template.",
    sizes: [
      {
        value: "One size; options: task chair, dual posture chair, stool (stool AP only); EMEA also EN 1335 Type A",
        scope: "EMEA/AP",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody-ii_zody-lx_sales-presentation_eu_en_2026.pdf",
        sourceTitle: "Zody II & Zody LX sales presentation, EU (PDF, 2026)",
        checkedOn: "2026-09-26",
        quote: "Zody II … Posture types: Task chair (available also in Type A EN 1335) · Dual posture chair · Stool (only in AP)"
      }
    ],
    seatHeight: [
      {
        value: "406–533 mm (office chair); 445–615 mm (dual posture)",
        unit: "mm",
        scope: "Asia Pacific market",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_product_sheets_ap_en_2025.pdf",
        sourceTitle: "Zody II product sheet, Asia Pacific (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "SH: * 406 - 533 ** 445 - 615 mm * Office Chair ** Dual posture",
        computedImperial: "16–21 in; 17.5–24.2 in"
      },
      {
        value: "410–530 mm (office chair); 430–590 mm (dual posture); 400–530 mm (EN 1335 Type A)",
        unit: "mm",
        scope: "EMEA market",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/Zody-II_product-sheet_eu_en_2025.pdf",
        sourceTitle: "Zody II product sheet, EMEA (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "SH: * 410 - 530 ** 430 - 590 *** 400 - 530 mm * Office Chair ** Dual posture *** Type A",
        computedImperial: "16.1–20.9 in; 16.9–23.2 in; 15.7–20.9 in"
      },
      {
        value: "40–53 cm | 43–59 cm (Dual posture)",
        unit: "cm",
        scope: "EMEA web comparison table",
        sourceUrl: "https://www.haworth.com/eu/en/products/office-chairs/zody-ii.html",
        sourceTitle: "Zody II | Office Chair | Haworth Europe",
        checkedOn: "2026-09-26",
        quote: "PNEUMATIC HEIGHT … 40 - 53cm | 43 - 59cm (Dual posture)",
        displayExcluded: "rounded; the EMEA product sheet (410–530 mm) is the spec document"
      },
      {
        value: "16–21 (Standard Posture); 17.5–24.5 (Dual Posture)",
        unit: "in",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "Standard Posture: Seat Height: 16\"–21\" Dual Posture: Seat Height: 17.5\"–24.5\"",
        computedMetric: "40.6–53.3 cm",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    seatDepth: [
      {
        value: "427–495 mm (76 mm adjustment)",
        unit: "mm",
        scope: "Asia Pacific market",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_product_sheets_ap_en_2025.pdf",
        sourceTitle: "Zody II product sheet, Asia Pacific (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "SD : 427 - 495 mm",
        computedImperial: "16.8–19.5 in"
      },
      {
        value: "425–503 mm (74 mm adjustment)",
        unit: "mm",
        scope: "EMEA market",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/Zody-II_product-sheet_eu_en_2025.pdf",
        sourceTitle: "Zody II product sheet, EMEA (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "SD : 425 - 503 mm",
        computedImperial: "16.7–19.8 in"
      },
      {
        value: "16.8–19.5 with lumbar; 17.5–20.2 without lumbar",
        unit: "in",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "Seat Depth: with Lumbar: 16.8\"-19.5\" Seat Depth: without Lumbar: 17.5\"-20.2\"",
        computedMetric: "42.7–49.5 cm with lumbar; 44.5–51.3 cm without",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    seatWidth: [
      {
        value: "19.5",
        unit: "in",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "Seat Width: 19.5\"",
        computedMetric: "49.5 cm",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    weightCapacity: [
      {
        value: "< 181",
        unit: "kg",
        scope: "Asia Pacific web comparison table",
        sourceUrl: "https://www.haworth.com/ap/en/products/office-chairs/zody-ii.html",
        sourceTitle: "Zody II | Office Chair | Haworth Asia Pacific",
        checkedOn: "2026-09-26",
        quote: "WEIGHT CAPACITY … < 181kg",
        computedImperial: "399 lb"
      },
      {
        value: "400",
        unit: "lb",
        scope: "Asia Pacific warranty (24/7 multiple shift)",
        sourceUrl: "https://www.haworth.com/content/dam/digital/ap/docs/products/warranties/haworth_ap_product_warranty_bilingual.pdf",
        sourceTitle: "Haworth Asia Pacific Product Warranty (PDF, bilingual)",
        checkedOn: "2026-09-26",
        quote: "warranted for 24/7 multiple shift use by persons up to 325 lbs (400 lbs for Zody II and LX models)",
        computedMetric: "181.4 kg",
        displayExcluded: "Warranty use condition, not a published capacity figure"
      },
      {
        value: "< 150",
        unit: "kg",
        scope: "EMEA web comparison table",
        sourceUrl: "https://www.haworth.com/eu/en/products/office-chairs/zody-ii.html",
        sourceTitle: "Zody II | Office Chair | Haworth Europe",
        checkedOn: "2026-09-26",
        quote: "WEIGHT CAPACITY … < 150kg",
        computedImperial: "331 lb"
      },
      {
        value: "350 without forward tilt; 325 with forward tilt",
        unit: "lb",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "Warrantied for people up to 350 lbs without forward tilt option Warrantied for people up to 325 lbs with forward tilt option",
        computedMetric: "158.8 kg / 147.4 kg",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    recline: [
      {
        value: "Balanced 3-point tilt: back reclines 24° from upright, seat pan moves down 3°; back stop in 6 positions (upright and every 4°); forward tilt; tilt tension crank",
        scope: "Asia Pacific user guide",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_user_guide_ap_en_202311.pdf",
        sourceTitle: "Zody II User Guide, AP (PDF, 2023-11)",
        checkedOn: "2026-09-26",
        quote: "Back reclines 24° from the upright position. Seat pan moves downward 3° from the initial position. … Back stops in 6 positions - upright and every 4° backward."
      },
      {
        value: "3-point synchronous tilt; Back Stop; Tilt Tension; Forward Tilt (seat forward 5°); optional Dual Posture",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "a 3-point synchronous tilt system that aligns with the body's natural pivot points — hip, knee, and ankle … Tilt the seat forward by 5°",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    arms: [
      {
        value: "4D arms (EMEA: 4D only); AP also fixed, height-adjustable (1D) or armless",
        scope: "market-dependent",
        sourceUrl: "https://www.haworth.com/ap/en/products/office-chairs/zody-ii.html",
        sourceTitle: "Zody II | Office Chair | Haworth Asia Pacific",
        checkedOn: "2026-09-26",
        quote: "ARMREST … 4D, 1D, Fixed"
      },
      {
        value: "4D arms: height, side to side, front to back, arm cap pivot",
        scope: "AP product sheet",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_product_sheets_ap_en_2025.pdf",
        sourceTitle: "Zody II product sheet, Asia Pacific (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "4D arms fluidly adjust in height, side to side, front to back, and arm cap pivot position; also available with fixed or height-adjustable arms"
      },
      {
        value: "Arm height 193–295 mm above the seat",
        unit: "mm",
        scope: "product sheets",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_product_sheets_ap_en_2025.pdf",
        sourceTitle: "Zody II product sheet, Asia Pacific (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "AH: 193 - 295 mm",
        computedImperial: "7.6–11.6 in"
      },
      {
        value: "4D Arms: in and out, up and down, side to side, front to back",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "Get full support for your neck and shoulders with arms that move in and out, up and down, side to side, and front to back.",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ],
    lumbar: [
      {
        value: "PAL™ (Pelvic and Asymmetrical Lumbar) back system: height-adjustable lumbar with independent left/right support; AP also height-adjustable lumbar or no lumbar",
        scope: "market-dependent",
        sourceUrl: "https://www.haworth.com/content/dam/digital/int/docs/products/haworth/seating/zody-ii/zody_ii_product_sheets_ap_en_2025.pdf",
        sourceTitle: "Zody II product sheet, Asia Pacific (PDF, © 2025 Haworth)",
        checkedOn: "2026-09-26",
        quote: "Pelvic and Asymmetrical Lumbar (PAL™) back system provides independently adjustable support for each side of the lower back"
      }
    ],
    headrest: [
      {
        value: "Not yet generally available: listed as '(phase 2)' in Asia Pacific and 'coming soon' in EMEA",
        scope: "not yet generally available",
        sourceUrl: "https://www.haworth.com/ap/en/products/office-chairs/zody-ii.html",
        sourceTitle: "Zody II | Office Chair | Haworth Asia Pacific",
        checkedOn: "2026-09-26",
        quote: "HEADREST (ADJUSTABLE) … (phase 2)"
      }
    ],
    warranty: [
      {
        value: "12 years, 24/7 multiple shift (Asia Pacific)",
        scope: "Asia Pacific",
        sourceUrl: "https://www.haworth.com/content/dam/digital/ap/docs/products/warranties/haworth_ap_product_warranty_bilingual.pdf",
        sourceTitle: "Haworth Asia Pacific Product Warranty (PDF, bilingual)",
        checkedOn: "2026-09-26",
        quote: "Twelve (12) Years All Haworth AP manufactured seating … is warranted for 24/7 multiple shift use by persons up to 325 lbs (400 lbs for Zody II and LX models)"
      },
      {
        value: "12 year warranty",
        scope: "US Haworth Store 'Zody Office Chair'",
        sourceUrl: "https://store.haworth.com/products/zody-office-chair",
        sourceTitle: "Zody Office Chair – Haworth Store (US) [sold as 'Zody', not 'Zody II']",
        checkedOn: "2026-09-26",
        quote: "12 year warranty",
        displayExcluded: "Sold on the US Haworth Store as 'Zody Office Chair'; not confirmed as Zody II by name"
      }
    ]
  },
  "okamura-contessa-ii": {
    officialName: "Contessa II (Okamura; Japanese name コンテッサ セコンダ / Contessa seconda; design ITALDESIGN)",
    sizes: [
      {
        value: "One size (high back): mesh or cushion seat, with 4D arm or fixed arm",
        scope: "all",
        sourceUrl: "https://okamura.ent.box.com/s/qbtjkiaz27eytjb71s4m8suu0eqxsfbr/folder/156267804123",
        sourceTitle: "Okamura Contessa II Spec Guide, Global (BIFMA, mm), January 2026",
        checkedOn: "2026-09-26",
        quote: "1: High Back, Mesh Seat, with 4D arm 2: High Back, Mesh Seat, with Fixed arm 3: High Back, Cushion Seat, with 4D arm 4: High Back, Cushion Seat, Fixed arm"
      }
    ],
    seatHeight: [
      {
        value: "434–544",
        unit: "mm",
        scope: "Global Spec Guide, BIFMA (mm) Standard, 5-star swivel (all back/seat types)",
        sourceUrl: "https://okamura.ent.box.com/s/qbtjkiaz27eytjb71s4m8suu0eqxsfbr/folder/156267804123",
        sourceTitle: "Okamura Contessa II Spec Guide, Global (BIFMA, mm), January 2026",
        checkedOn: "2026-09-26",
        quote: "[ BIFMA（㎜）Standard ] … 5-Star Swivel … 434～544",
        computedImperial: "17.1–21.4 in"
      },
      {
        value: "420–520",
        unit: "mm",
        scope: "Japan (外形寸法代表図 representative drawing; JP catalog 2025-01 identical)",
        sourceUrl: "https://www.okamura.co.jp/catalog/pdf/contessa_seconda_external_dimensions.pdf",
        sourceTitle: "Okamura Japan dimension drawing: Contessa Seconda (Japanese PDF)",
        checkedOn: "2026-09-26",
        quote: "420- -520",
        computedImperial: "16.5–20.5 in",
        displayExcluded: "Japanese drawing measured at a different point; the global BIFMA spec guide value is shown"
      },
      {
        value: "100 mm height adjustment",
        unit: "mm",
        scope: "Japan product page",
        sourceUrl: "https://product.okamura.co.jp/ext/DispCate.do?volumeName=00001&lv3=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5+%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80",
        sourceTitle: "Okamura Japan product page: Contessa Seconda (Japanese)",
        checkedOn: "2026-09-26",
        quote: "座面高さ調節 右肘の操作レバーにより、座面の高さ調節が行なえます。上下ストロークは100㎜です。",
        computedImperial: "3.9 in"
      }
    ],
    seatDepth: [
      {
        value: "400–450",
        unit: "mm",
        scope: "Global Spec Guide (BIFMA) and Japan drawing (same)",
        sourceUrl: "https://okamura.ent.box.com/s/qbtjkiaz27eytjb71s4m8suu0eqxsfbr/folder/156267804123",
        sourceTitle: "Okamura Contessa II Spec Guide, Global (BIFMA, mm), January 2026",
        checkedOn: "2026-09-26",
        quote: "400～450",
        computedImperial: "15.7–17.7 in"
      }
    ],
    seatWidth: [
      {
        value: "530 mm (cushion seat); 520 mm (mesh seat)",
        unit: "mm",
        scope: "Global Spec Guide (BIFMA)",
        sourceUrl: "https://okamura.ent.box.com/s/qbtjkiaz27eytjb71s4m8suu0eqxsfbr/folder/156267804123",
        sourceTitle: "Okamura Contessa II Spec Guide, Global (BIFMA, mm), January 2026",
        checkedOn: "2026-09-26",
        quote: "Cushion Seat … 530 … Mesh Seat … 520",
        computedImperial: "20.9 in; 20.5 in"
      }
    ],
    backHeight: [
      {
        value: "Back width 502 (no back height stated)",
        unit: "mm",
        scope: "Global Spec Guide / JP drawing",
        sourceUrl: "https://www.okamura.co.jp/catalog/pdf/contessa_seconda_external_dimensions.pdf",
        sourceTitle: "Okamura Japan dimension drawing: Contessa Seconda (Japanese PDF)",
        checkedOn: "2026-09-26",
        quote: "502 (背)",
        computedImperial: "19.8 in",
        displayExcluded: "width, not height; no official backrest height"
      }
    ],
    weightCapacity: [
      {
        value: "300",
        unit: "lb",
        scope: "global (BIFMA X5.1 tested)",
        sourceUrl: "https://www.okamura.com/products/contessa-ii/?area=asia-pacific",
        sourceTitle: "Contessa II | Okamura global (okamura.com, Asia Pacific English)",
        checkedOn: "2026-09-26",
        quote: "This chair has been designed and tested for users weighing up to 300lbs (136Kg).",
        computedMetric: "136 kg (official)"
      }
    ],
    recline: [
      {
        value: "Ankle-tilt reclining; recline angle 26°",
        scope: "Japan",
        sourceUrl: "https://product.okamura.co.jp/ext/DispCate.do?volumeName=00001&lv3=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5+%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80",
        sourceTitle: "Okamura Japan product page: Contessa Seconda (Japanese)",
        checkedOn: "2026-09-26",
        quote: "アンクルチルトリクライニング くるぶしを中心として、背と座がシンクロしてスライドするアンクルチルトリクライニング。…（リクライニング角度：26°）"
      },
      {
        value: "Fingertip adjustment for recline and height; ankle-tilt reclining",
        scope: "global",
        sourceUrl: "https://www.okamura.com/products/contessa-ii/?area=asia-pacific",
        sourceTitle: "Contessa II | Okamura global (okamura.com, Asia Pacific English)",
        checkedOn: "2026-09-26",
        quote: "To recline, simply lean backwards, tilting from your ankles. Ankle-tilt reclining maintains a natural posture throughout."
      }
    ],
    arms: [
      {
        value: "Adjust Arm (4D arm): up/down 100 mm; angle 15° inward, 7.5° outward; front/back 40 mm; side to side 25 mm each way",
        scope: "Adjustable arm models (Japan)",
        sourceUrl: "https://product.okamura.co.jp/ext/DispCate.do?volumeName=00001&lv3=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5+%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80",
        sourceTitle: "Okamura Japan product page: Contessa Seconda (Japanese)",
        checkedOn: "2026-09-26",
        quote: "アジャストアーム（４Dアーム） これまでの肘パッド部の上下（1D）、角度（2D）、前後（3D）の動きに加え、左右方向（4D）の調節が可能です。上下は100㎜、角度は内側15°、外側7.5°、前後は40㎜、左右は片側25㎜ずつ可動します。"
      },
      {
        value: "4D arm or fixed arm; armrest height from the floor 604–814 mm (4D arm), 639–749 mm (fixed arm)",
        unit: "mm",
        scope: "Global Spec Guide (BIFMA), 5-star swivel",
        sourceUrl: "https://okamura.ent.box.com/s/qbtjkiaz27eytjb71s4m8suu0eqxsfbr/folder/156267804123",
        sourceTitle: "Okamura Contessa II Spec Guide, Global (BIFMA, mm), January 2026",
        checkedOn: "2026-09-26",
        quote: "With Adjustable Arms … 604～814 … With Fixed Arms … 639～749",
        computedImperial: "23.8–32 in; 25.2–29.5 in"
      }
    ],
    lumbar: [
      {
        value: "Optional lumbar support with 60 mm height adjustment (can be retrofitted)",
        scope: "option",
        sourceUrl: "https://product.okamura.co.jp/ext/DispCate.do?volumeName=00001&lv3=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5+%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80",
        sourceTitle: "Okamura Japan product page: Contessa Seconda (Japanese)",
        checkedOn: "2026-09-26",
        quote: "ランバーサポート 体格に合わせて、上下60㎜の調節が可能です。",
        computedImperial: "2.4 in"
      }
    ],
    headrest: [
      {
        value: "Options: large fixed headrest or small adjustable headrest (up/down, front/back, swivel)",
        scope: "option",
        sourceUrl: "https://product.okamura.co.jp/ext/DispCate.do?volumeName=00001&lv3=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5+%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80",
        sourceTitle: "Okamura Japan product page: Contessa Seconda (Japanese)",
        checkedOn: "2026-09-26",
        quote: "大型固定ヘッドレスト ワイドタイプの固定式ヘッドレスト。… 小型可動ヘッドレスト 上下はもちろん、前後への移動や首振り機能も備えています。"
      }
    ],
    warranty: [
      {
        value: "10 years: structural components, including mechanisms and adjustable arms; 5 years: casters, gas cylinder, adjustment levers; 2 years: coating finish, mesh and fabric, cushions, arm pads",
        scope: "Global General Warranty (excludes Japan; products made after 1 Jan 2022)",
        sourceUrl: "https://www.okamura.com/warranty/?area=asia-pacific",
        sourceTitle: "Okamura Global General Warranty Statement (excludes Japan)",
        checkedOn: "2026-09-26",
        quote: "Ten (10) years Structural components, including frames, shells, bases, operating mechanisms including adjustable arms / Five (5) years Casters, Gas cylinder, Adjustment levers / Two (2) years Coating finish, mesh & fabric, cushions, and arm-pads"
      },
      {
        value: "Japan: 1 year finish/surfaces, 2 years mechanisms/moving parts, 8 years structure (JOIFA guideline; 8 h/day office use)",
        scope: "Japan (取扱説明書 2021-07)",
        sourceUrl: "https://www.okamura.co.jp/catalog/pdf/contessa_seconda_manual_202107.pdf",
        sourceTitle: "Okamura Japan user manual: Contessa Seconda, July 2021 (Japanese PDF)",
        checkedOn: "2026-09-26",
        quote: "通常の状態で使用された場合、3つの種別ごとに（お客様ご購入の日から）1年・2年・8年としております。… 外観・表面仕上げ … １年 機構部・可動部 … ２年 構造体 強度・構造体にかかわる破損 8年",
        displayExcluded: "Japan-market terms; the global (outside Japan) warranty statement is shown"
      }
    ]
  }
}

export function getOfficialSpecs(slug?: string | null): OfficialSpecs | undefined {
  return slug ? officialSpecs[slug] : undefined
}
