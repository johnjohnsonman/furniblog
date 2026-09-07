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

// Confirmed-gone legacy content from the old Korean WordPress site: the flat
// Korean post slugs (a single non-ASCII path segment) and the WP category/tag
// archives. These have no live equivalent and are NOT being restored, so they
// return 410 Gone. We deliberately DO NOT blanket-redirect unknown paths to an
// unrelated homepage (Google treats that as a soft 404); unknown *ASCII*
// single-segment paths (typos / future routes) fall through to a normal 404.
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
  // Old Korean flat post slugs: a single path segment (not a file, not a known
  // route) containing non-ASCII (Korean) characters.
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 1 && !segments[0].includes(".") && !KNOWN_ROUTES.has(segments[0])) {
    let decoded = segments[0]
    try {
      decoded = decodeURIComponent(segments[0])
    } catch {
      /* keep raw */
    }
    if ([...decoded].some((ch) => ch.charCodeAt(0) > 127)) return true
  }
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Retired standalone money page — its chairs are now regular products.
  if (pathname === "/amazon-picks") {
    return NextResponse.redirect(new URL("/products", request.url), 308)
  }

  // Legacy Korean WordPress content that is permanently gone.
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
