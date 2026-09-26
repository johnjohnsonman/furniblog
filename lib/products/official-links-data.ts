/**
 * Official buying channels for chairs without a buyable Amazon US listing.
 * Client-safe data: product pages and shared buy buttons (SmartBuyLink,
 * RegionalAmazonLink) read it so no page falls back to an Amazon search for
 * these chairs. Stage-1 URLs mirror price-provenance sourceUrl; brand links were
 * checked for HTTP 200 and the model name on 2026-09-26.
 */
export type OfficialLink = {
  kind: "store" | "site" | "dealer" | "quote"
  url: string
  /** Button text, without the trailing arrow. */
  label: string
  /** Retailer name for the Where-to-buy row. */
  retailer: string
  /** One line under the button. */
  note: string
}

const JAPAN_STORE_NOTE = "Official store in Japan. Confirm shipping to your country, warranty and returns before ordering."
const QUOTE_NOTE = "No published price. The brand quotes by configuration, so ask for the exact build you want."
const BRAND_NOTE = "Not sold on Amazon US. Buy through the brand or its authorized dealers — check availability and price in your country."
const DEALER_NOTE = "Not sold on Amazon US. Use the brand's dealer finder for availability and price in your country."

export const OFFICIAL_LINKS: Record<string, OfficialLink> = {
  // Japan-only chairs: the official shop is the sourced price page.
  "kokuyo-ing-cloud": { kind: "store", url: "https://workstyle.kokuyo.co.jp/shop/c/c1165/", label: "View on KOKUYO official store", retailer: "KOKUYO Workstyle Shop (Japan)", note: JAPAN_STORE_NOTE },
  "kokuyo-ing": { kind: "store", url: "https://workstyle.kokuyo.co.jp/shop/c/c1111_ssp/", label: "View on KOKUYO official store", retailer: "KOKUYO Workstyle Shop (Japan)", note: JAPAN_STORE_NOTE },
  // The Amazon US listing (Contessa Seconda, white) showed "Currently unavailable" on 2026-09-25.
  "okamura-contessa-ii": { kind: "store", url: "https://lifestylestore.okamura.co.jp/products/cc88xs-ff71", label: "View on OKAMURA official store", retailer: "OKAMURA Lifestyle Store (Japan)", note: JAPAN_STORE_NOTE },
  // ITOKI's product page moved; its official launch notice links to the ITOKI shop.
  "itoki-act2": { kind: "site", url: "https://www.itoki.jp/company/news/2025/2505_act2/", label: "View on ITOKI official site", retailer: "ITOKI (Japan)", note: "Official ITOKI page in Japan. Confirm where to buy in your country before ordering." },
  // Contract chairs sold through dealers, quote only.
  "wilkhahn-on": { kind: "quote", url: "https://www.wilkhahn.com/en-us/products/task-chairs-office-chairs/on/", label: "Ask for a quote", retailer: "Wilkhahn US (dealer network)", note: QUOTE_NOTE },
  "hag-tion": { kind: "quote", url: "https://store.flokk.com/us/en-gb/products/hag-tion", label: "Ask for a quote", retailer: "Flokk US store (ask for price)", note: QUOTE_NOTE },

  // Hub product flagged notOnAmazon (content-hubs), same page as its price source.
  "herman-miller-embody-gaming": { kind: "store", url: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US", label: "View on Herman Miller Store", retailer: "US Herman Miller Store", note: "Not sold on Amazon. Warranty, shipping and returns follow the official store's terms — check before ordering." },

  // Brands not sold on Amazon US (dealer, contract or home-market channels).
  "ahrend-2020": { kind: "site", url: "https://www.ahrend.com/en/products/office-seating/ahrend-2020-collection/", label: "View on Ahrend site", retailer: "Ahrend official site", note: BRAND_NOTE },
  "bene-bay-chair": { kind: "site", url: "https://bene.com/en/products/chair-upholstered-furniture/chair/bay-chair", label: "View on Bene site", retailer: "Bene official site", note: BRAND_NOTE },
  "boss-design-mera": { kind: "site", url: "https://www.kloeber.com/en/products/mera", label: "View on Klöber site", retailer: "Klöber official site", note: BRAND_NOTE },
  "cassina-cab-412": { kind: "site", url: "https://www.cassina.com/ww/en/products/cab-412.html", label: "View on Cassina site", retailer: "Cassina official site", note: BRAND_NOTE },
  "dauphin-just-evo": { kind: "site", url: "https://www.dauphin.de/dauphin/de/englisch/products/office-chairs/just-evo", label: "View on Dauphin site", retailer: "Dauphin official site", note: BRAND_NOTE },
  "dauphin-magnum": { kind: "site", url: "https://www.dauphin.com/", label: "View on Dauphin site", retailer: "Dauphin official site", note: BRAND_NOTE },
  "flexform-morgan": { kind: "site", url: "https://www.flexform.it/en/products/indoor/all-products/dining-chairs-chairs/morgan", label: "View on Flexform site", retailer: "Flexform official site", note: BRAND_NOTE },
  "flokk-rh-logic-400": { kind: "site", url: "https://store.flokk.com/us/en-gb/products/rh-logic", label: "View on Flokk site", retailer: "Flokk official site", note: BRAND_NOTE },
  "flokk-rh-mereo": { kind: "site", url: "https://info.flokk.com/en/global/rh/rh-mereo", label: "View on Flokk site", retailer: "Flokk official site", note: BRAND_NOTE },
  "girsberger-diagon": { kind: "site", url: "https://girsberger.com/en/products/seating/swivel-chairs/diagon/", label: "View on Girsberger site", retailer: "Girsberger official site", note: BRAND_NOTE },
  "hag-sofi": { kind: "site", url: "https://hag.flokk.com/en/hag-sofi", label: "View on HÅG site", retailer: "HÅG official site", note: BRAND_NOTE },
  "interstuhl-every-e3": { kind: "site", url: "https://www.interstuhl.com/I/us-en/every.php", label: "View on Interstuhl site", retailer: "Interstuhl official site", note: BRAND_NOTE },
  "interstuhl-hero": { kind: "site", url: "https://www.interstuhl.com/I/us-en/modelle.php?modell=172HU", label: "View on Interstuhl site", retailer: "Interstuhl official site", note: BRAND_NOTE },
  "interstuhl-joyceis3": { kind: "site", url: "https://www.interstuhl.com/I/us-en/joyce.php", label: "View on Interstuhl site", retailer: "Interstuhl official site", note: BRAND_NOTE },
  "interstuhl-movyis3": { kind: "dealer", url: "https://www.interstuhl.com/I/us-en/dealersearch.php", label: "Find an Interstuhl dealer", retailer: "Interstuhl dealer finder", note: DEALER_NOTE },
  "interstuhl-pure-active": { kind: "site", url: "https://www.interstuhl.com/I/us-en/pure.php", label: "View on Interstuhl site", retailer: "Interstuhl official site", note: BRAND_NOTE },
  "interstuhl-silver-262s": { kind: "site", url: "https://www.interstuhl.com/I/ia-en/modelle.php?modell=262S", label: "View on Interstuhl site", retailer: "Interstuhl official site", note: BRAND_NOTE },
  "itoki-spina": { kind: "site", url: "https://www.itoki.jp/en/special/spina/index.html", label: "View on ITOKI site", retailer: "ITOKI official site", note: BRAND_NOTE },
  "itoki-vertebra-03": { kind: "site", url: "https://vertebra.jp/", label: "View on ITOKI site", retailer: "ITOKI official site", note: BRAND_NOTE },
  "itoki-vertebra-03-wood": { kind: "site", url: "https://vertebra.jp/lineup/vertebra-wood/", label: "View on ITOKI site", retailer: "ITOKI official site", note: BRAND_NOTE },
  "kastel-kruna": { kind: "site", url: "https://www.kastel.it/en/product/kruna-plus-office-chair-executive-linear/", label: "View on Kastel site", retailer: "Kastel official site", note: BRAND_NOTE },
  "keilhauer-swurve": { kind: "site", url: "https://keilhauer.com/product-family/swurve/", label: "View on Keilhauer site", retailer: "Keilhauer official site", note: BRAND_NOTE },
  "kinnarps-capella": { kind: "site", url: "https://www.kinnarps.us/products/families/capella-x/", label: "View on Kinnarps site", retailer: "Kinnarps official site", note: BRAND_NOTE },
  "klober-connex2": { kind: "site", url: "https://www.kloeber.com/en/products/connex2", label: "View on Klöber site", retailer: "Klöber official site", note: BRAND_NOTE },
  "kokuyo-duora": { kind: "site", url: "https://kokuyo-furniture.com/products/office-chairs/duora/", label: "View on Kokuyo site", retailer: "Kokuyo official site", note: BRAND_NOTE },
  "kokuyo-entry": { kind: "site", url: "https://kokuyo-furniture.com/products/office-chairs/entry/", label: "View on Kokuyo site", retailer: "Kokuyo official site", note: BRAND_NOTE },
  "konig-neurath-okay-2": { kind: "site", url: "https://www.koenig-neurath.com/en/", label: "View on König + Neurath site", retailer: "König + Neurath official site", note: BRAND_NOTE },
  "martela-kilta": { kind: "site", url: "https://www.martela.com/furniture/furniture-families/kilta", label: "View on Martela site", retailer: "Martela official site", note: BRAND_NOTE },
  "okamura-baron": { kind: "site", url: "https://www.okamura.com/products/baron/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "okamura-duke": { kind: "site", url: "https://www.okamura.com/en_ap/products/categories/seating/executive/duke/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "okamura-legender": { kind: "site", url: "https://www.okamura.com/products/legender/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "okamura-portone": { kind: "site", url: "https://www.okamura.com/products/portone/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "okamura-sabrina": { kind: "site", url: "https://www.okamura.com/products/sabrina/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "okamura-sylphy": { kind: "site", url: "https://www.okamura.com/products/sylphy/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "orangebox-do": { kind: "site", url: "https://www.orangebox.com/products/do", label: "View on Orangebox site", retailer: "Orangebox official site", note: BRAND_NOTE },
  "poltrona-frau-archibald": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/archibald-task-office-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-dora": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/isadora-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-downtown": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/downtown-office-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-oxford-executive": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/oxford-office-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-oxford-president": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/oxford-office-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-oxford-visitor": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/oxford-visitor-chair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "poltrona-frau-vanity-fair-xc": { kind: "site", url: "https://www.poltronafrau.com/us/en/products/vanity-fair-xc-armchair.html", label: "View on Poltrona Frau site", retailer: "Poltrona Frau official site", note: BRAND_NOTE },
  "sedus-black-dot": { kind: "site", url: "https://www.sedus.com/en/products/chairs/black-dot", label: "View on Sedus site", retailer: "Sedus official site", note: BRAND_NOTE },
  "sedus-open-up": { kind: "site", url: "https://www.sedus.com/en/products/chairs/open-up", label: "View on Sedus site", retailer: "Sedus official site", note: BRAND_NOTE },
  "sedus-sedo": { kind: "site", url: "https://www.sedus.com/en/products/chairs/sedo-pro-2", label: "View on Sedus site", retailer: "Sedus official site", note: BRAND_NOTE },
  "teknion-projek": { kind: "site", url: "https://www.teknion.com/products/product-detail/projek", label: "View on Teknion site", retailer: "Teknion official site", note: BRAND_NOTE },
  "uchida-finora": { kind: "site", url: "https://www.okamura.com/products/finora/", label: "View on Okamura site", retailer: "Okamura official site", note: BRAND_NOTE },
  "walter-knoll-375-armchair": { kind: "site", url: "https://www.walterknoll.de/en/products/lounge-chairs/375-armchair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-andoo-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/andoo-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-andoo-lounge-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/lounge-chairs/andoo-lounge-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-burgaz-chair": { kind: "dealer", url: "https://www.walterknoll.de/en/store", label: "Find a Walter Knoll dealer", retailer: "Walter Knoll dealer finder", note: DEALER_NOTE },
  "walter-knoll-fk-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/fk-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-healey-lounge-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/lounge-chairs/healey-lounge-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-leadchair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/leadchair-executive", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-leadchair-management": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/leadchair-management", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-liz-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/liz-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-osuu-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/Osuu-Chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-sheru-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/chairs-barstools/sheru-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-turtle-lounge-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/lounge-chairs/turtle-lounge-chair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "walter-knoll-vostra-chair": { kind: "site", url: "https://www.walterknoll.de/en/products/lounge-chairs/vostra-armchair", label: "View on Walter Knoll site", retailer: "Walter Knoll official site", note: BRAND_NOTE },
  "wilkhahn-at": { kind: "site", url: "https://www.wilkhahn.com/en-us/products/task-chairs-office-chairs/at/", label: "View on Wilkhahn site", retailer: "Wilkhahn official site", note: BRAND_NOTE },
  "wilkhahn-fs": { kind: "site", url: "https://www.wilkhahn.com/en-us/products/task-chairs-office-chairs/fs/", label: "View on Wilkhahn site", retailer: "Wilkhahn official site", note: BRAND_NOTE },
  "wilkhahn-graph": { kind: "site", url: "https://www.wilkhahn.com/en-us/products/conference-chairs/graph/", label: "View on Wilkhahn site", retailer: "Wilkhahn official site", note: BRAND_NOTE },
  "wilkhahn-modus": { kind: "site", url: "https://www.wilkhahn.com/en-us/products/task-chairs-office-chairs/modus/", label: "View on Wilkhahn site", retailer: "Wilkhahn official site", note: BRAND_NOTE },
  // KI and Vitra block automated checks (bot protection); these pages were opened
  // in a browser by the owner on 2026-09-26. Includes KI Altus: no Amazon US listing.
  "ki-altus": { kind: "site", url: "https://www.ki.com/products/name/altus-task-chair/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "ki-impress": { kind: "site", url: "https://www.ki.com/products/name/impress-task-chair/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "ki-kiaura": { kind: "site", url: "https://www.ki.com/products/by-collection/kiaura-collection/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "ki-ruckus": { kind: "site", url: "https://www.ki.com/products/name/ruckus-chair/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "ki-signia": { kind: "site", url: "https://www.ki.com/products/name/signia-task-chair/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "ki-torsion-air": { kind: "site", url: "https://www.ki.com/products/name/torsion-air-task-chair/", label: "View on KI site", retailer: "KI official site", note: BRAND_NOTE },
  "vitra-grand-executive": { kind: "site", url: "https://www.vitra.com/en-us/product/grand-executive", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-grand-repos": { kind: "site", url: "https://www.vitra.com/en-us/product/details/grand-repos", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-id-chair-concept": { kind: "site", url: "https://www.vitra.com/en-us/product/id-chair-concept", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-id-soft": { kind: "site", url: "https://www.vitra.com/en-us/product/details/id-soft", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-id-trim": { kind: "site", url: "https://www.vitra.com/en-us/product/details/id-trim", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-lobby-chair-es-104": { kind: "site", url: "https://www.vitra.com/en-un/product/details/lobby-chair-es-104", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-pacific-chair": { kind: "site", url: "https://www.vitra.com/en-us/office/product/details/pacific-chair", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-physix": { kind: "site", url: "https://www.vitra.com/en-us/product/physix", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-physix-conference": { kind: "site", url: "https://www.vitra.com/en-us/product/details/596625", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
  "vitra-soft-pad-chair-ea-219": { kind: "site", url: "https://www.vitra.com/en-un/product/details/126193", label: "View on Vitra site", retailer: "Vitra official site", note: BRAND_NOTE },
}

export function getOfficialLink(slug: string | null | undefined): OfficialLink | null {
  return slug ? OFFICIAL_LINKS[slug] ?? null : null
}
