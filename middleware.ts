import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Legacy Korean WordPress content moved to the Chairpark blog. Catch-all 301 so
// old furniblog.com URLs don't 404 once the domain points at the new site.
const LEGACY_BLOG_HOME = "https://blog.chairpark.com/blog"

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

function isLegacyWordpressPath(pathname: string): boolean {
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
  // Old WordPress flat post slugs: a single path segment that isn't a known new
  // route and isn't a file.
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 1) {
    const seg = segments[0]
    if (!KNOWN_ROUTES.has(seg) && !seg.includes(".")) return true
  }
  return false
}

export function middleware(request: NextRequest) {
  // Retired standalone money page — its chairs are now regular products.
  if (request.nextUrl.pathname === "/amazon-picks") {
    return NextResponse.redirect(new URL("/products", request.url), 308)
  }

  if (isLegacyWordpressPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(LEGACY_BLOG_HOME, 301)
  }

  const geoCountry =
    request.headers.get("x-vercel-ip-country") ??
    (request as NextRequest & { geo?: { country?: string } }).geo?.country ??
    "US"
  const country = geoCountry === "KR" ? "KR" : geoCountry === "JP" ? "JP" : "US"

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
