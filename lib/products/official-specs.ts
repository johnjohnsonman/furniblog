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
  }
}

export function getOfficialSpecs(slug?: string | null): OfficialSpecs | undefined {
  return slug ? officialSpecs[slug] : undefined
}
