import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
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
