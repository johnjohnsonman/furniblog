export const AFFILIATE_LINKS_DATA: Record<
  string,
  Array<{
    retailer: string
    url: string
    isOfficial: boolean
    priceUsd?: number
    priceKrw?: number
  }>
> = {
  // Direct Amazon product (ASIN) links for chairs actually buyable on Amazon.
  // No tag here — buildAffiliateUrl injects NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG at
  // render time. ASINs verified June 2026; refresh periodically.
  "ergohuman-elite": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B003Y5BF7A", isOfficial: false }],
  "ergohuman-classic": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B002LK1YNO", isOfficial: false }],
  "duorest-alpha": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07Y3X1H5J", isOfficial: false }],
  "duorest-gold-plus": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07Y3Y13HN", isOfficial: false }],
  "sidiz-t50": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B083FBN9BH", isOfficial: false }],
  "sihoo-doro-c300": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0C3T865C2", isOfficial: false }],
  "sihoo-m18": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07GNDDNMW", isOfficial: false }],
  "nouhaus-ergo3d": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07L4ZQMDX", isOfficial: false }],
  "hbada-p5": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0BWDQX8RH", isOfficial: false }],
  "flexispot-c7": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0DPQQ2L22", isOfficial: false }],
  "ticova-ergonomic": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B08LBJXVSP", isOfficial: false }],
  "branch-ergonomic-chair": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0C15B3HN1", isOfficial: false }],
  "branch-verve": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0C15BD9XV", isOfficial: false }],
  "gabrylly-ergonomic": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07Y8BXBX8", isOfficial: false }],
  "mimoglad-high-back": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B09N93L2RQ", isOfficial: false }],
  "hon-ignition-2": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07ZGFPQNW", isOfficial: false }],
  "duramont-ergonomic": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0797HZ8W1", isOfficial: false }],
  "sweetcrispy-high-back-mesh": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0CSK1LN4M", isOfficial: false }],
  "modway-articulate": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B006IY89ZA", isOfficial: false }],
  "bestoffice-mesh-task": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0147WIC7E", isOfficial: false }],
  "razer-iskur-v2": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0CPH72BMN", isOfficial: false }],
  "razer-iskur-v2-x": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0DP5SY554", isOfficial: false }],
  "razer-enki": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0CGGT138N", isOfficial: false }],
  "corsair-tc100-relaxed": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0BN6RRD5V", isOfficial: false }],
  "gtracing-gaming": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0F2J176C2", isOfficial: false }],
  "homall-racing": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07TXNYS5J", isOfficial: false }],
  "furmax-gaming": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B01LXXM5EK", isOfficial: false }],
  "dowinx-gaming": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07VXPWCN8", isOfficial: false }],
  "serta-fairbanks": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B00AVUQQES", isOfficial: false }],
  // Catalog expansion (2026) — HNI family + major US office brands. ASINs
  // researched June 2026 from listing titles; spot-check periodically.
  "hon-wave": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B001MS6ROW", isOfficial: false }],
  "hon-nucleus": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0BM1SGV4J", isOfficial: false }],
  "hon-convergence": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0CZBG2X2N", isOfficial: false }],
  "allsteel-acuity": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B081RFKTTN", isOfficial: false }],
  "allsteel-mimeo": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0954V7DW7", isOfficial: false }],
  "x-chair-x1": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B01HSCS9XW", isOfficial: false }],
  "x-chair-x2": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B01HSEZK7I", isOfficial: false }],
  "x-chair-x3": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07K6W84NQ", isOfficial: false }],
  "x-chair-x4": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B01HTYUPXQ", isOfficial: false }],
  "uplift-pursuit": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B07T6C3RDL", isOfficial: false }],
  "uplift-envoke": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0CFSSQ6SR", isOfficial: false }],
  "la-z-boy-trafford": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0116W5BG8", isOfficial: false }],
  "la-z-boy-delano": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0116W5B5O", isOfficial: false }],
  "la-z-boy-bellamy": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0116W5PR8", isOfficial: false }],
  "office-star-ventilated-managers": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B01EHQ5GNS", isOfficial: false }],
  "office-star-progrid": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B00450P182", isOfficial: false }],
  "boss-office-b991": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B00J5WJRMG", isOfficial: false }],
  "flash-furniture-mid-back-mesh": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B001EJK3MG", isOfficial: false }],
  "sihoo-doro-s300": [{ retailer: "Amazon", url: "https://www.amazon.com/dp/B0DQTRVSHS", isOfficial: false }],
  // uplift-vert: not sold on Amazon US (DTC / Amazon.ca only) → auto search-link fallback.
  "herman-miller-aeron-b": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
      isOfficial: true,
      priceUsd: 1495,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+aeron+size+b",
      isOfficial: false,
      priceUsd: 1395,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 1890000,
    },
  ],
  "herman-miller-aeron-c": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
      isOfficial: true,
      priceUsd: 1635,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+aeron+size+c",
      isOfficial: false,
      priceUsd: 1535,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 2290000,
    },
  ],
  "herman-miller-embody": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/",
      isOfficial: true,
      priceUsd: 1795,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+embody",
      isOfficial: false,
      priceUsd: 1695,
    },
  ],
  "herman-miller-cosm-high-back": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/",
      isOfficial: true,
      priceUsd: 1795,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+cosm+high+back",
      isOfficial: false,
      priceUsd: 1695,
    },
  ],
  "herman-miller-cosm-low-back": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/",
      isOfficial: true,
      priceUsd: 1495,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+cosm+low+back",
      isOfficial: false,
      priceUsd: 1395,
    },
  ],
  "herman-miller-sayl": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/",
      isOfficial: true,
      priceUsd: 595,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+sayl",
      isOfficial: false,
      priceUsd: 545,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 890000,
    },
  ],
  "herman-miller-lino": [
    {
      retailer: "Herman Miller Official",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/lino-chair/",
      isOfficial: true,
      priceUsd: 795,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=herman+miller+lino",
      isOfficial: false,
      priceUsd: 745,
    },
  ],
  "steelcase-leap-v2": [
    {
      retailer: "Steelcase Official",
      url: "https://www.steelcase.com/products/office-chairs/leap/",
      isOfficial: true,
      priceUsd: 1569,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=steelcase+leap+v2",
      isOfficial: false,
      priceUsd: 1299,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 1890000,
    },
  ],
  "steelcase-gesture": [
    {
      retailer: "Steelcase Official",
      url: "https://www.steelcase.com/products/office-chairs/gesture/",
      isOfficial: true,
      priceUsd: 1569,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=steelcase+gesture",
      isOfficial: false,
      priceUsd: 1199,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 2100000,
    },
  ],
  "steelcase-think-v2": [
    {
      retailer: "Steelcase Official",
      url: "https://www.steelcase.com/products/office-chairs/think/",
      isOfficial: true,
      priceUsd: 1199,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=steelcase+think+v2",
      isOfficial: false,
      priceUsd: 999,
    },
  ],
  "steelcase-series-1": [
    {
      retailer: "Steelcase Official",
      url: "https://www.steelcase.com/products/office-chairs/series-1/",
      isOfficial: true,
      priceUsd: 695,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/dp/B08M42B334",
      isOfficial: false,
      priceUsd: 649,
    },
  ],
  "steelcase-respawn-gaming": [
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=steelcase+gaming+chair",
      isOfficial: false,
      priceUsd: 499,
    },
  ],
  "okamura-contessa-2": [
    {
      retailer: "Okamura Official",
      url: "https://www.okamura.co.jp/product/seating/contessa2/",
      isOfficial: true,
      priceUsd: 2200,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=okamura+contessa+2",
      isOfficial: false,
      priceUsd: 2100,
    },
  ],
  "okamura-sylphy": [
    {
      retailer: "Okamura Official",
      url: "https://www.okamura.co.jp/product/seating/sylphy/",
      isOfficial: true,
      priceUsd: 1100,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=okamura+sylphy",
      isOfficial: false,
      priceUsd: 1050,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 1200000,
    },
  ],
  "okamura-portone": [
    {
      retailer: "Okamura Official",
      url: "https://www.okamura.co.jp/product/seating/portone/",
      isOfficial: true,
      priceUsd: 2800,
    },
  ],
  "okamura-cronos": [
    {
      retailer: "Okamura Official",
      url: "https://www.okamura.co.jp",
      isOfficial: true,
      priceUsd: 1500,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=okamura+cronos",
      isOfficial: false,
      priceUsd: 1400,
    },
  ],
  "humanscale-freedom": [
    {
      retailer: "Humanscale Official",
      url: "https://www.humanscale.com/products/seating/freedom-chair",
      isOfficial: true,
      priceUsd: 1549,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=humanscale+freedom",
      isOfficial: false,
      priceUsd: 1399,
    },
  ],
  "humanscale-world-one": [
    {
      retailer: "Humanscale Official",
      url: "https://www.humanscale.com/products/seating/world-one-chair",
      isOfficial: true,
      priceUsd: 1895,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=humanscale+world+one",
      isOfficial: false,
      priceUsd: 1795,
    },
  ],
  "haworth-fern": [
    {
      retailer: "Haworth Official",
      url: "https://www.haworth.com/na/en/products/seating/task/fern.html",
      isOfficial: true,
      priceUsd: 2200,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=haworth+fern+chair",
      isOfficial: false,
      priceUsd: 1999,
    },
  ],
  "haworth-comforto-59": [
    {
      retailer: "Haworth Official",
      url: "https://www.haworth.com",
      isOfficial: true,
      priceUsd: 1200,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=haworth+comforto",
      isOfficial: false,
      priceUsd: 1100,
    },
  ],
  "haworth-comforto-29": [
    {
      retailer: "Haworth Official",
      url: "https://www.haworth.com",
      isOfficial: true,
      priceUsd: 800,
    },
  ],
  "hag-capisco": [
    {
      retailer: "HÅG Official",
      url: "https://www.hag-global.com/products/office-chairs/hag-capisco/",
      isOfficial: true,
      priceUsd: 1495,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=hag+capisco",
      isOfficial: false,
      priceUsd: 1395,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 1650000,
    },
  ],
  "hag-capisco-puls": [
    {
      retailer: "HÅG Official",
      url: "https://www.hag-global.com/products/office-chairs/hag-capisco-puls/",
      isOfficial: true,
      priceUsd: 1295,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=hag+capisco+puls",
      isOfficial: false,
      priceUsd: 1195,
    },
  ],
  "hag-tion": [
    {
      retailer: "HÅG Official",
      url: "https://www.hag-global.com",
      isOfficial: true,
      priceUsd: 995,
    },
  ],
  "flokk-rh-logic-400": [
    {
      retailer: "Flokk Official",
      url: "https://www.flokk.com/global/products/rh-logic-400",
      isOfficial: true,
      priceUsd: 1299,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=rh+logic+400",
      isOfficial: false,
      priceUsd: 1199,
    },
  ],
  "kokuyo-ing": [
    {
      retailer: "Kokuyo Official",
      url: "https://www.kokuyo-furniture.co.jp/search/products/ing/",
      isOfficial: true,
      priceUsd: 380,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=kokuyo+ing",
      isOfficial: false,
      priceUsd: 350,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 450000,
    },
  ],
  "kokuyo-ing-cloud": [
    {
      retailer: "Kokuyo Official",
      url: "https://www.kokuyo-furniture.co.jp/search/products/ing/",
      isOfficial: true,
      priceUsd: 580,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=kokuyo+ing+cloud",
      isOfficial: false,
      priceUsd: 550,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 680000,
    },
  ],
  "kokuyo-crg": [
    {
      retailer: "Kokuyo Official",
      url: "https://www.kokuyo-furniture.co.jp",
      isOfficial: true,
      priceUsd: 450,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=kokuyo+crg",
      isOfficial: false,
      priceUsd: 420,
    },
  ],
  "itoki-act2": [
    {
      retailer: "Itoki Official",
      url: "https://www.itoki.jp/product/chair/act2/",
      isOfficial: true,
      priceUsd: 850,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=itoki+act2",
      isOfficial: false,
      priceUsd: 800,
    },
    {
      retailer: "Coupang",
      url: "https://link.coupang.com/a/AF1321768",
      isOfficial: false,
      priceKrw: 980000,
    },
  ],
  "itoki-leala": [
    {
      retailer: "Itoki Official",
      url: "https://www.itoki.jp",
      isOfficial: true,
      priceUsd: 650,
    },
    {
      retailer: "Amazon Japan",
      url: "https://www.amazon.co.jp/s?k=itoki+leala",
      isOfficial: false,
      priceUsd: 600,
    },
  ],
  "itoki-karuga": [
    {
      retailer: "Itoki Official",
      url: "https://www.itoki.jp",
      isOfficial: true,
      priceUsd: 1200,
    },
  ],
  "vitra-id-chair-concept": [
    {
      retailer: "Vitra Official",
      url: "https://www.vitra.com/en-gb/office/product/details/id-chair-concept",
      isOfficial: true,
      priceUsd: 1800,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=vitra+id+chair",
      isOfficial: false,
      priceUsd: 1700,
    },
  ],
  "vitra-id-trim": [
    {
      retailer: "Vitra Official",
      url: "https://www.vitra.com",
      isOfficial: true,
      priceUsd: 1600,
    },
  ],
  "vitra-pacific-chair": [
    {
      retailer: "Vitra Official",
      url: "https://www.vitra.com",
      isOfficial: true,
      priceUsd: 1400,
    },
  ],
  "vitra-eames-aluminium-group": [
    {
      retailer: "Vitra Official",
      url: "https://www.vitra.com/en-gb/residential/product/details/eames-aluminium-group",
      isOfficial: true,
      priceUsd: 2200,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=eames+aluminium+group",
      isOfficial: false,
      priceUsd: 2100,
    },
  ],
  "vitra-physix": [
    {
      retailer: "Vitra Official",
      url: "https://www.vitra.com",
      isOfficial: true,
      priceUsd: 1500,
    },
  ],
  "wilkhahn-on": [
    {
      retailer: "Wilkhahn Official",
      url: "https://www.wilkhahn.com/en/products/on-office-swivel-chair/",
      isOfficial: true,
      priceUsd: 1800,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=wilkhahn+on+chair",
      isOfficial: false,
      priceUsd: 1700,
    },
  ],
  "wilkhahn-at": [
    {
      retailer: "Wilkhahn Official",
      url: "https://www.wilkhahn.com",
      isOfficial: true,
      priceUsd: 1600,
    },
  ],
  "wilkhahn-fs": [
    {
      retailer: "Wilkhahn Official",
      url: "https://www.wilkhahn.com",
      isOfficial: true,
      priceUsd: 1200,
    },
  ],
  "girsberger-enjoy": [
    {
      retailer: "Girsberger Official",
      url: "https://www.girsberger.com",
      isOfficial: true,
      priceUsd: 1400,
    },
  ],
  "girsberger-diagon": [
    {
      retailer: "Girsberger Official",
      url: "https://www.girsberger.com",
      isOfficial: true,
      priceUsd: 2000,
    },
  ],
  "interstuhl-silver-262s": [
    {
      retailer: "Interstuhl Official",
      url: "https://www.interstuhl.com",
      isOfficial: true,
      priceUsd: 1200,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=interstuhl+silver",
      isOfficial: false,
      priceUsd: 1100,
    },
  ],
  "poltrona-frau-dora": [
    {
      retailer: "Poltrona Frau Official",
      url: "https://www.poltronafrau.com",
      isOfficial: true,
      priceUsd: 3500,
    },
  ],
  "autonomous-ergochair-pro": [
    {
      retailer: "Autonomous Official",
      url: "https://www.autonomous.ai/office-chairs/ergonomic-chair",
      isOfficial: true,
      priceUsd: 499,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/dp/B0FL2F3W34",
      isOfficial: false,
      priceUsd: 449,
    },
  ],
  "bambach-saddle-seat": [
    {
      retailer: "Bambach Official",
      url: "https://www.bambach.com.au",
      isOfficial: true,
      priceUsd: 895,
    },
    {
      retailer: "Amazon",
      url: "https://www.amazon.com/s?k=bambach+saddle+seat",
      isOfficial: false,
      priceUsd: 845,
    },
  ],
  "konig-neurath-teo": [
    {
      retailer: "König+Neurath Official",
      url: "https://www.koenig-neurath.com",
      isOfficial: true,
      priceUsd: 1100,
    },
  ],
}
