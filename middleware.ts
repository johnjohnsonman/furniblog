import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Top-level routes that belong to the new (English) Furniblog site.
const KNOWN_ROUTES = new Set([
  "products",
  "reviews",
  "news",
  "best",
  "brands",
  "videos",
  "gallery",
  "chairpedia",
  "chair",
  "blog",
  "compare",
  "find-your-chair",
  "amazon-picks",
  "about",
  "contact",
  "designers",
  "experience",
  "affiliate-disclosure",
  "editorial-policy",
  "privacy",
  "terms",
  "admin",
  "api",
  "sitemap.xml",
  "robots.txt",
])

// Confirmed-gone legacy content from the old Korean WordPress site, returned as
// 410 Gone (no live equivalent; not restored). This is a CONFIRMED list — the
// flat post slugs actually indexed by Google (from Search Console) plus the WP
// /tag & /category archives. Any other unknown path (including other non-ASCII
// or symbol paths) falls through to a normal 404 — we do NOT block by a broad
// pattern.
const LEGACY_SLUGS = new Set([
  "2026-코엑스-리빙페어-5일-동안-의자-얘기만-해도-시간",
  "2026-트렌드-인체공학-의자-추천",
  "ceo-의자-추천-애플-ceo는-어떤-의자에-앉을까",
  "ing-cloud-고쿠요-체어파크",
  "✔️프리미엄-의자-구매-전-체크리스트-실패-확률-확",
  "꼬리뼈-안-아픈-의자-체어파크에-있어요",
  "뉴욕현대미술관moma이-사랑한-브랜드는-일하는-의자",
  "메쉬-패브릭-의자-차이-지금-고민-끝내기",
  "목-건강에-좋은-의자-거북목-의자-헤드레스트-편한-의",
  "서울리빙디자인페어에서-프리미엄-오피스체어-만",
  "성공한-사람의-데스크테리어",
  "의자-쇼룸-방문-전-필독",
  "의자-텐션-조절-하이엔드-의자-유격-체어파크",
  "의자-향기-관리",
  "임스-체어-가-아직도-사랑받는-이유",
  "주식용-의자-게이밍-의자-단점",
  "직업-별로-잘-맞는-하이엔드-의자는-따로-있다",
  "코쿠요-ing-체어-다이어트-의자-앉아서-살-빼는-의자",
  "하루-8시간-앉아도-다이어트-고쿠요-다이어트-의자",
  "하이엔드-의자-매장-체어파크에서-프리미엄-의자-체",
])

function isLegacyGone(pathname: string): boolean {
  // Old WordPress category & tag archives (incl. /tag/x/page/2/ pagination).
  if (
    pathname === "/category" ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/category-2/") ||
    pathname === "/tag" ||
    pathname.startsWith("/tag/")
  ) {
    return true
  }
  // Confirmed flat Korean post slugs only.
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 1) {
    let seg = segments[0]
    try {
      seg = decodeURIComponent(seg)
    } catch {
      /* keep raw */
    }
    if (LEGACY_SLUGS.has(seg)) return true
  }
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Retired standalone money page — its chairs are now regular products.
  if (pathname === "/amazon-picks") {
    return NextResponse.redirect(new URL("/products", request.url), 308)
  }

  // Confirmed legacy Korean WordPress content that is permanently gone.
  if (isLegacyGone(pathname)) {
    return new NextResponse("410 Gone — this page has been removed.", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  }

  const geoCountry =
    request.headers.get("x-vercel-ip-country") ??
    (request as NextRequest & { geo?: { country?: string } }).geo?.country ??
    "US"
  // Southeast Asia → routed to Shopee/Lazada; KR → Coupang; JP → Amazon.co.jp.
  const SEA = new Set(["SG", "MY", "ID", "TH", "PH", "VN"])
  const country =
    geoCountry === "KR"
      ? "KR"
      : geoCountry === "JP"
        ? "JP"
        : SEA.has(geoCountry)
          ? geoCountry
          : "US"

  const response = NextResponse.next()
  response.headers.set("x-country", country)
  response.cookies.set("x-country", country, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
