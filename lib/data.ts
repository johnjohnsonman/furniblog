// Mock data for Furniblog - Premium Furniture Database

export interface Product {
  id: string
  name: string
  brand: string
  brandId: string
  category: string
  chairType?: string
  price: string
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  rating: number
  reviewCount: number
  country: string
  image: string
  images?: string[]
  designer?: string
  designerId?: string
  year?: number
  description?: string
  overview?: string
  bestFor?: string
  materials?: string[]
  dimensions?: string
  weight?: string
  warranty?: string
  adjustments?: string[]
  pros?: string[]
  cons?: string[]
  scores?: {
    comfort: number
    ergonomics: number
    buildQuality: number
    design: number
    value: number
    longHourUse: number
  }
  availableInKorea?: boolean
  tryAtChairpark?: boolean
  reviewSummary?: string
  // Affiliate URLs
  officialUrl?: string
  amazonUrl?: string
  rakutenUrl?: string
  coupangUrl?: string
  naverUrl?: string
  chairparkUrl?: string
}

export interface Brand {
  id: string
  name: string
  country: string
  founded: number
  logo: string
  description: string
  productCount: number
  category: string
  website?: string
}

export interface Designer {
  id: string
  name: string
  country: string
  born: number
  image: string
  bio: string
  notableWorks: string[]
  brands: string[]
}

export interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  author: string
  rating: number
  title: string
  excerpt: string
  date: string
}

export interface Comparison {
  id: string
  title: string
  products: { id: string; name: string; image: string }[]
  views: number
}

export const chairTypes = [
  "All",
  "Mesh Back",
  "Task Chair",
  "Executive",
  "Gaming",
  "Kneeling",
  "Saddle",
  "Lounge",
]

export const categories = ["All", "Office Chair", "Lounge Chair"]

export const countries = ["All", "USA", "Germany", "Norway", "Switzerland", "Japan"]

export const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "$ (Under $500)", value: "$" },
  { label: "$$ ($500-$999)", value: "$$" },
  { label: "$$$ ($1000-$1999)", value: "$$$" },
  { label: "$$$$ ($2000+)", value: "$$$$" },
]

export const ratingRanges = [
  { label: "All Ratings", value: "all" },
  { label: "4.5+ Stars", value: "4.5" },
  { label: "4.0+ Stars", value: "4.0" },
  { label: "3.5+ Stars", value: "3.5" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Aeron Chair",
    brand: "Herman Miller",
    brandId: "herman-miller",
    category: "Office Chair",
    chairType: "Mesh Back",
    price: "$1,395",
    priceRange: "$$$",
    rating: 4.8,
    reviewCount: 2847,
    country: "USA",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=800&h=800&fit=crop",
    ],
    designer: "Bill Stumpf & Don Chadwick",
    designerId: "bill-stumpf",
    year: 1994,
    description: "The iconic ergonomic office chair that revolutionized workplace seating.",
    overview: "The Aeron Chair redefined the office chair category when it launched in 1994. Its innovative Pellicle suspension material and ergonomic design made it an instant icon. Now in its remastered form, the Aeron continues to set the standard for performance seating.",
    bestFor: "Long hours at desk",
    materials: ["Recycled Plastic", "Aluminum", "Pellicle Mesh"],
    dimensions: "27\" W x 16.75\" D x 41\" H",
    weight: "41 lbs",
    warranty: "12 years",
    adjustments: ["Seat Height", "Tilt Tension", "Tilt Limiter", "Armrest Height", "Armrest Width", "Armrest Depth", "Lumbar Height", "Lumbar Depth"],
    pros: [
      "Excellent breathability with Pellicle mesh",
      "Outstanding lumbar support system",
      "12-year warranty shows build confidence",
      "Three sizes ensure perfect fit",
      "Environmentally responsible materials"
    ],
    cons: [
      "High price point",
      "Mesh seat not for everyone",
      "Limited recline angle",
      "Can feel firm for first-time users"
    ],
    scores: {
      comfort: 88,
      ergonomics: 95,
      buildQuality: 98,
      design: 90,
      value: 75,
      longHourUse: 96
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Aeron Chair remains the gold standard for ergonomic office seating. While the price is significant, the 12-year warranty and exceptional build quality justify the investment for anyone spending 8+ hours at a desk.",
    officialUrl: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
    amazonUrl: "https://www.amazon.com/dp/B01N0XP5FA",
    coupangUrl: "https://www.coupang.com/",
    naverUrl: "https://search.shopping.naver.com/",
    chairparkUrl: "https://chairpark.co.kr/"
  },
  {
    id: "2",
    name: "Embody Chair",
    brand: "Herman Miller",
    brandId: "herman-miller",
    category: "Office Chair",
    chairType: "Task Chair",
    price: "$1,795",
    priceRange: "$$$$",
    rating: 4.7,
    reviewCount: 1523,
    country: "USA",
    image: "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=800&h=800&fit=crop",
    designer: "Bill Stumpf & Jeff Weber",
    designerId: "bill-stumpf",
    year: 2008,
    description: "Designed to support your body and mind for hours of focused work.",
    overview: "The Embody Chair was designed to support the way the body and mind work together. Its pixelated support system mimics the human spine, promoting blood flow and oxygen circulation for better focus and productivity.",
    bestFor: "Creative professionals",
    materials: ["Die-cast Aluminum", "Pixelated Support", "Multi-layer Backrest"],
    dimensions: "29.5\" W x 15\" D x 45\" H",
    weight: "51 lbs",
    warranty: "12 years",
    adjustments: ["Seat Height", "Seat Depth", "Tilt Tension", "Tilt Limiter", "Armrest Height", "Armrest Width", "BackFit Adjustment"],
    pros: [
      "Unique pixelated backrest support",
      "Promotes circulation and focus",
      "Excellent for long work sessions",
      "Premium materials throughout"
    ],
    cons: [
      "Very expensive",
      "Learning curve for adjustments",
      "Limited color options",
      "Arms can feel plasticky"
    ],
    scores: {
      comfort: 92,
      ergonomics: 94,
      buildQuality: 95,
      design: 88,
      value: 68,
      longHourUse: 94
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Embody excels for creative professionals and developers who need sustained focus. Its unique spine-mimicking design offers a different approach to comfort than traditional mesh chairs.",
    officialUrl: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/",
    amazonUrl: "https://www.amazon.com/dp/B01DGM7ZGI",
    chairparkUrl: "https://chairpark.co.kr/"
  },
  {
    id: "3",
    name: "Gesture Chair",
    brand: "Steelcase",
    brandId: "steelcase",
    category: "Office Chair",
    chairType: "Task Chair",
    price: "$1,199",
    priceRange: "$$$",
    rating: 4.6,
    reviewCount: 892,
    country: "USA",
    image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&h=800&fit=crop",
    designer: "Steelcase Design Studio",
    year: 2013,
    description: "The first chair designed for all the ways we work today.",
    overview: "Gesture was designed based on a global study of how people work with today's technology. Its revolutionary arms move like human arms, supporting a wide range of postures and devices.",
    bestFor: "Multi-device users",
    materials: ["Steel", "Foam", "Fabric"],
    dimensions: "24.75\" W x 15.25\" D x 43.5\" H",
    weight: "73 lbs",
    warranty: "12 years",
    adjustments: ["Seat Height", "Seat Depth", "Tilt Tension", "Recline Lock", "Armrest 4D", "Lumbar Height"],
    pros: [
      "Best-in-class armrest system",
      "Supports device-intensive work",
      "Comfortable for all postures",
      "Excellent recline mechanism"
    ],
    cons: [
      "Heavy chair",
      "Seat can run warm",
      "Limited mesh options",
      "Arms can be complex to adjust"
    ],
    scores: {
      comfort: 91,
      ergonomics: 90,
      buildQuality: 93,
      design: 82,
      value: 78,
      longHourUse: 90
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Gesture is perfect for users who frequently switch between devices and postures. Its innovative arm design sets it apart from competitors.",
    officialUrl: "https://www.steelcase.com/products/office-chairs/gesture/",
    amazonUrl: "https://www.amazon.com/dp/B016OIF2KA",
    chairparkUrl: "https://chairpark.co.kr/"
  },
  {
    id: "4",
    name: "Leap Chair",
    brand: "Steelcase",
    brandId: "steelcase",
    category: "Office Chair",
    chairType: "Task Chair",
    price: "$1,049",
    priceRange: "$$$",
    rating: 4.5,
    reviewCount: 1247,
    country: "USA",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&h=800&fit=crop",
    designer: "Steelcase Design Studio",
    year: 1999,
    description: "Revolutionary LiveBack technology that mimics the movement of your spine.",
    overview: "The Leap Chair features LiveBack technology that changes shape to mimic the natural movement of your spine, providing continuous support as you move throughout the day.",
    bestFor: "Budget-conscious buyers",
    materials: ["Steel", "Foam", "Fabric"],
    dimensions: "27\" W x 16.5\" D x 43\" H",
    weight: "54 lbs",
    warranty: "12 years",
    adjustments: ["Seat Height", "Seat Depth", "Tilt Tension", "Lumbar Firmness", "Upper Back Force", "Armrest 4D"],
    pros: [
      "LiveBack mimics spine movement",
      "Natural glide recline",
      "Excellent value for features",
      "Proven design over decades"
    ],
    cons: [
      "No mesh option",
      "Armrests can loosen over time",
      "Dated aesthetic",
      "Seat cushion can compress"
    ],
    scores: {
      comfort: 87,
      ergonomics: 89,
      buildQuality: 88,
      design: 75,
      value: 85,
      longHourUse: 88
    },
    availableInKorea: true,
    tryAtChairpark: false,
    reviewSummary: "The Leap offers exceptional ergonomic value. Its LiveBack technology and comprehensive adjustments make it a reliable choice for most users.",
    officialUrl: "https://www.steelcase.com/products/office-chairs/leap/",
    amazonUrl: "https://www.amazon.com/dp/B006H1QYBA"
  },
  {
    id: "5",
    name: "Barcelona Chair",
    brand: "Knoll",
    brandId: "knoll",
    category: "Lounge Chair",
    chairType: "Lounge",
    price: "$7,562",
    priceRange: "$$$$",
    rating: 4.9,
    reviewCount: 456,
    country: "USA",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop",
    designer: "Ludwig Mies van der Rohe",
    designerId: "mies-van-der-rohe",
    year: 1929,
    description: "An icon of modernist furniture design, originally created for the German Pavilion.",
    overview: "Designed for the German Pavilion at the 1929 Barcelona Exposition, this chair embodies the modernist philosophy of 'less is more.' Its clean lines and luxurious materials have made it an enduring symbol of sophisticated design.",
    bestFor: "Design collectors",
    materials: ["Stainless Steel", "Leather"],
    dimensions: "29.5\" W x 30\" D x 30\" H",
    weight: "66 lbs",
    warranty: "Lifetime (structure)",
    adjustments: [],
    pros: [
      "Iconic timeless design",
      "Museum-quality craftsmanship",
      "Premium leather develops patina",
      "Statement piece for any space"
    ],
    cons: [
      "Extremely expensive",
      "Not ergonomic for extended sitting",
      "Heavy and hard to move",
      "Leather requires maintenance"
    ],
    scores: {
      comfort: 75,
      ergonomics: 50,
      buildQuality: 99,
      design: 100,
      value: 60,
      longHourUse: 40
    },
    availableInKorea: true,
    tryAtChairpark: false,
    reviewSummary: "The Barcelona Chair is an investment in design history. While not suited for everyday work, it elevates any space with its sculptural presence.",
    officialUrl: "https://www.knoll.com/product/barcelona-chair"
  },
  {
    id: "6",
    name: "Eames Lounge Chair",
    brand: "Herman Miller",
    brandId: "herman-miller",
    category: "Lounge Chair",
    chairType: "Lounge",
    price: "$7,395",
    priceRange: "$$$$",
    rating: 4.9,
    reviewCount: 1892,
    country: "USA",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop",
    designer: "Charles & Ray Eames",
    designerId: "charles-eames",
    year: 1956,
    description: "The ultimate in comfortable sophistication, a timeless design classic.",
    overview: "Charles and Ray Eames wanted to create a chair with 'the warm, receptive look of a well-used first baseman's mitt.' The result is this iconic lounge chair that combines traditional craftsmanship with modern production techniques.",
    bestFor: "Reading and relaxation",
    materials: ["Molded Plywood", "Leather", "Aluminum"],
    dimensions: "32.75\" W x 32.75\" D x 32.25\" H",
    weight: "59 lbs",
    warranty: "Lifetime (structure), 12 years (leather)",
    adjustments: ["Ottoman Positioning"],
    pros: [
      "Exceptional comfort for reading",
      "Iconic mid-century design",
      "Premium materials age beautifully",
      "Ottoman included"
    ],
    cons: [
      "Very expensive",
      "Large footprint",
      "Not for work/productivity",
      "Requires careful maintenance"
    ],
    scores: {
      comfort: 95,
      ergonomics: 70,
      buildQuality: 98,
      design: 100,
      value: 65,
      longHourUse: 60
    },
    availableInKorea: true,
    tryAtChairpark: false,
    reviewSummary: "The Eames Lounge Chair is the ultimate statement piece for relaxation. Its comfort and iconic design make it a worthy investment for design enthusiasts.",
    officialUrl: "https://www.hermanmiller.com/products/seating/lounge-seating/eames-lounge-chair-and-ottoman/"
  },
  {
    id: "7",
    name: "HAG Capisco",
    brand: "Flokk",
    brandId: "flokk",
    category: "Office Chair",
    chairType: "Saddle",
    price: "$1,299",
    priceRange: "$$$",
    rating: 4.4,
    reviewCount: 634,
    country: "Norway",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop",
    designer: "Peter Opsvik",
    designerId: "peter-opsvik",
    year: 1984,
    description: "Inspired by the horseback riding position for dynamic sitting.",
    overview: "The Capisco challenges traditional sitting with its saddle-like seat that encourages movement and varied postures. Perfect for sit-stand desks and active workers.",
    bestFor: "Standing desk users",
    materials: ["Recycled Plastic", "Steel", "Fabric"],
    dimensions: "24\" W x 24\" D x 33\" H",
    weight: "24 lbs",
    warranty: "10 years",
    adjustments: ["Seat Height", "Seat Depth", "Tilt Tension", "Backrest Height"],
    pros: [
      "Encourages active sitting",
      "Perfect for standing desks",
      "Sustainable materials",
      "Unique aesthetic"
    ],
    cons: [
      "Saddle seat not for everyone",
      "Limited padding",
      "Takes time to adapt",
      "Backrest minimal"
    ],
    scores: {
      comfort: 75,
      ergonomics: 82,
      buildQuality: 85,
      design: 90,
      value: 78,
      longHourUse: 70
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Capisco is ideal for active sitters and standing desk users. Its unconventional design promotes movement but requires an adjustment period.",
    officialUrl: "https://www.flokk.com/hag/products/hag-capisco",
    amazonUrl: "https://www.amazon.com/dp/B07F3HVBKC",
    chairparkUrl: "https://chairpark.co.kr/"
  },
  {
    id: "8",
    name: "Setu Chair",
    brand: "Herman Miller",
    brandId: "herman-miller",
    category: "Office Chair",
    chairType: "Task Chair",
    price: "$629",
    priceRange: "$$",
    rating: 4.3,
    reviewCount: 423,
    country: "USA",
    image: "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=800&h=800&fit=crop",
    designer: "Studio 7.5",
    year: 2009,
    description: "Instant comfort that adapts to you automatically.",
    overview: "The Setu Chair offers sophisticated comfort without complex adjustments. Its Kinematic Spine and Lyris elastomer suspension provide immediate, intuitive support.",
    bestFor: "Meeting rooms",
    materials: ["Aluminum", "Lyris 2 Elastomer", "AireWeave 2 Suspension"],
    dimensions: "24\" W x 23.5\" D x 38\" H",
    weight: "24 lbs",
    warranty: "5 years",
    adjustments: ["Seat Height"],
    pros: [
      "No adjustment needed",
      "Lightweight and mobile",
      "Clean aesthetic",
      "Good entry price point"
    ],
    cons: [
      "Limited adjustability",
      "5-year warranty only",
      "No lumbar adjustment",
      "Not for all-day use"
    ],
    scores: {
      comfort: 78,
      ergonomics: 72,
      buildQuality: 80,
      design: 85,
      value: 82,
      longHourUse: 65
    },
    availableInKorea: false,
    tryAtChairpark: false,
    reviewSummary: "The Setu is excellent for meeting rooms or supplementary seating. Its auto-adjusting design makes it instantly comfortable for anyone.",
    officialUrl: "https://www.hermanmiller.com/products/seating/office-chairs/setu-chairs/"
  },
  {
    id: "9",
    name: "Freedom Chair",
    brand: "Humanscale",
    brandId: "humanscale",
    category: "Office Chair",
    chairType: "Task Chair",
    price: "$1,249",
    priceRange: "$$$",
    rating: 4.5,
    reviewCount: 756,
    country: "USA",
    image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&h=800&fit=crop",
    designer: "Niels Diffrient",
    designerId: "niels-diffrient",
    year: 1999,
    description: "Self-adjusting recline with no knobs or levers.",
    overview: "The Freedom Chair pioneered the concept of automatic ergonomics. Its weight-sensitive recline mechanism eliminates the need for manual tension adjustments.",
    bestFor: "Minimalists",
    materials: ["Aluminum", "Foam", "Fabric/Leather"],
    dimensions: "27\" W x 26\" D x 43\" H",
    weight: "38 lbs",
    warranty: "15 years",
    adjustments: ["Seat Height", "Armrest Height", "Headrest (optional)"],
    pros: [
      "Automatic recline tension",
      "Minimal, elegant design",
      "15-year warranty",
      "Gel seat option"
    ],
    cons: [
      "Limited adjustability by design",
      "Headrest costs extra",
      "Seat depth not adjustable",
      "Polarizing aesthetics"
    ],
    scores: {
      comfort: 86,
      ergonomics: 85,
      buildQuality: 90,
      design: 92,
      value: 80,
      longHourUse: 84
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Freedom Chair suits users who prefer simplicity. Its self-adjusting mechanism works well for most body types without any fiddling.",
    officialUrl: "https://www.humanscale.com/products/seating/freedom-task-chair",
    amazonUrl: "https://www.amazon.com/dp/B002LHT7BC",
    chairparkUrl: "https://chairpark.co.kr/"
  },
  {
    id: "10",
    name: "Cosm Chair",
    brand: "Herman Miller",
    brandId: "herman-miller",
    category: "Office Chair",
    chairType: "Mesh Back",
    price: "$1,295",
    priceRange: "$$$",
    rating: 4.6,
    reviewCount: 328,
    country: "USA",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop",
    designer: "Studio 7.5",
    year: 2018,
    description: "Instant comfort through intelligent design.",
    overview: "The Cosm Chair offers the most sophisticated auto-adjusting experience in the industry. Its Harmonic Tilt and Intercept suspension provide immediate, personalized support.",
    bestFor: "Shared workspaces",
    materials: ["Die-cast Aluminum", "Elastomer", "Suspension Material"],
    dimensions: "28.5\" W x 17\" D x 45\" H",
    weight: "39 lbs",
    warranty: "12 years",
    adjustments: ["Seat Height", "Tilt Limiter", "Armrest Height/Width"],
    pros: [
      "Auto-adjusting tilt",
      "Beautiful continuous design",
      "Three sizes available",
      "Excellent mesh quality"
    ],
    cons: [
      "No seat depth adjustment",
      "No lumbar adjustment",
      "Premium pricing",
      "Limited recline angle"
    ],
    scores: {
      comfort: 89,
      ergonomics: 88,
      buildQuality: 94,
      design: 95,
      value: 76,
      longHourUse: 86
    },
    availableInKorea: true,
    tryAtChairpark: true,
    reviewSummary: "The Cosm bridges the gap between looks and ergonomics. Its auto-adjusting features make it ideal for shared workspaces or users who dislike fiddling with controls.",
    officialUrl: "https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/",
    amazonUrl: "https://www.amazon.com/dp/B07VGCK8HV",
    chairparkUrl: "https://chairpark.co.kr/"
  },
]

export const brands: Brand[] = [
  {
    id: "herman-miller",
    name: "Herman Miller",
    country: "USA",
    founded: 1905,
    logo: "HM",
    description: "Pioneers of modern furniture design, known for iconic ergonomic office chairs and timeless residential pieces.",
    productCount: 847,
    category: "Office & Residential",
    website: "https://www.hermanmiller.com"
  },
  {
    id: "steelcase",
    name: "Steelcase",
    country: "USA",
    founded: 1912,
    logo: "SC",
    description: "Global leader in office furniture, architecture, and technology products for office environments.",
    productCount: 623,
    category: "Office",
    website: "https://www.steelcase.com"
  },
  {
    id: "knoll",
    name: "Knoll",
    country: "USA",
    founded: 1938,
    logo: "KN",
    description: "Renowned for furniture that combines modernist design principles with rigorous manufacturing standards.",
    productCount: 412,
    category: "Office & Residential",
    website: "https://www.knoll.com"
  },
  {
    id: "vitra",
    name: "Vitra",
    country: "Switzerland",
    founded: 1950,
    logo: "VT",
    description: "Swiss furniture company known for producing furniture by leading designers and its design museum.",
    productCount: 534,
    category: "Office & Residential",
    website: "https://www.vitra.com"
  },
  {
    id: "flokk",
    name: "Flokk",
    country: "Norway",
    founded: 1971,
    logo: "FK",
    description: "Scandinavian office furniture group committed to sustainability and ergonomic design.",
    productCount: 289,
    category: "Office",
    website: "https://www.flokk.com"
  },
  {
    id: "humanscale",
    name: "Humanscale",
    country: "USA",
    founded: 1983,
    logo: "HS",
    description: "Leader in ergonomic products that improve health and comfort at work.",
    productCount: 156,
    category: "Office",
    website: "https://www.humanscale.com"
  },
]

export const designers: Designer[] = [
  {
    id: "charles-eames",
    name: "Charles Eames",
    country: "USA",
    born: 1907,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Charles Eames was an American designer, architect, and filmmaker. Along with his wife Ray, he made major contributions to modern architecture and furniture design.",
    notableWorks: ["Eames Lounge Chair", "Eames Shell Chair", "Eames Aluminum Group"],
    brands: ["Herman Miller", "Vitra"]
  },
  {
    id: "bill-stumpf",
    name: "Bill Stumpf",
    country: "USA",
    born: 1936,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Bill Stumpf was an American industrial designer known for his ergonomic office chair designs, including the revolutionary Aeron Chair.",
    notableWorks: ["Aeron Chair", "Embody Chair", "Ergon Chair"],
    brands: ["Herman Miller"]
  },
  {
    id: "mies-van-der-rohe",
    name: "Ludwig Mies van der Rohe",
    country: "Germany",
    born: 1886,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Mies van der Rohe was a German-American architect who became one of the most influential architects of the 20th century.",
    notableWorks: ["Barcelona Chair", "Brno Chair", "MR Chair"],
    brands: ["Knoll"]
  },
  {
    id: "peter-opsvik",
    name: "Peter Opsvik",
    country: "Norway",
    born: 1939,
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop",
    bio: "Peter Opsvik is a Norwegian industrial designer known for his innovative seating designs that challenge conventional sitting.",
    notableWorks: ["HAG Capisco", "Tripp Trapp", "Variable Balans"],
    brands: ["Flokk", "Stokke"]
  },
  {
    id: "niels-diffrient",
    name: "Niels Diffrient",
    country: "USA",
    born: 1928,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Niels Diffrient was an American industrial designer known for his contributions to ergonomic design and the development of Humanscale products.",
    notableWorks: ["Freedom Chair", "Liberty Chair", "World Chair"],
    brands: ["Humanscale"]
  },
]

export const reviews: Review[] = [
  {
    id: "1",
    productId: "1",
    productName: "Aeron Chair",
    productImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    author: "James K.",
    rating: 5,
    title: "Worth every penny after 5 years",
    excerpt: "I've used my Aeron for over 5 years now, 8+ hours a day. Still works like new and my back thanks me daily.",
    date: "2024-01-15"
  },
  {
    id: "2",
    productId: "1",
    productName: "Aeron Chair",
    productImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    author: "Sarah M.",
    rating: 4,
    title: "Great chair, but mesh takes getting used to",
    excerpt: "Coming from a padded chair, the mesh seat felt strange at first. After a month, I can't imagine going back.",
    date: "2024-02-20"
  },
  {
    id: "3",
    productId: "2",
    productName: "Embody Chair",
    productImage: "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=400&h=400&fit=crop",
    author: "Mike T.",
    rating: 5,
    title: "Best chair for long coding sessions",
    excerpt: "As a software developer, I spend 10+ hours a day in this chair. The Embody has eliminated my back pain entirely.",
    date: "2024-03-10"
  },
  {
    id: "4",
    productId: "3",
    productName: "Gesture Chair",
    productImage: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop",
    author: "Lisa R.",
    rating: 5,
    title: "The arms make all the difference",
    excerpt: "I switch between laptop and monitors throughout the day. The 360-degree arm adjustment is a game-changer.",
    date: "2024-01-28"
  },
]

export const comparisons: Comparison[] = [
  {
    id: "1",
    title: "Aeron vs Embody",
    products: [
      { id: "1", name: "Aeron Chair", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop" },
      { id: "2", name: "Embody Chair", image: "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=400&h=400&fit=crop" },
    ],
    views: 45230
  },
  {
    id: "2",
    title: "Gesture vs Leap",
    products: [
      { id: "3", name: "Gesture Chair", image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop" },
      { id: "4", name: "Leap Chair", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&h=400&fit=crop" },
    ],
    views: 28410
  },
  {
    id: "3",
    title: "Aeron vs Gesture",
    products: [
      { id: "1", name: "Aeron Chair", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop" },
      { id: "3", name: "Gesture Chair", image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop" },
    ],
    views: 19870
  },
]

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find(b => b.id === id)
}

export function getDesignerById(id: string): Designer | undefined {
  return designers.find(d => d.id === id)
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter(p => p.brandId === brandId)
}

export function getProductsByDesigner(designerId: string): Product[] {
  return products.filter(p => p.designerId === designerId)
}

export function getSimilarProducts(product: Product, limit: number = 3): Product[] {
  return products
    .filter(p => p.id !== product.id && (p.category === product.category || p.brandId === product.brandId))
    .slice(0, limit)
}

export function getAverageScore(product: Product): number | null {
  if (!product.scores) return null
  const values = Object.values(product.scores)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

// Best lists data
export const bestLists = [
  { id: "best-office-chairs", title: "Best Office Chairs", count: 10 },
  { id: "best-ergonomic-chairs", title: "Best Ergonomic Chairs", count: 8 },
  { id: "best-for-back-pain", title: "Best Chairs for Back Pain", count: 6 },
  { id: "best-japanese-chairs", title: "Best Japanese Office Chairs", count: 5 },
  { id: "best-luxury-chairs", title: "Best Luxury Office Chairs", count: 6 },
  { id: "best-for-long-hours", title: "Best Chairs for Long Hours", count: 8 },
]
