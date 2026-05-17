import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, verifyAdminToken } from "./auth"

export function requireAdmin(request: NextRequest): NextResponse | null {
  const cookieToken = request.cookies.get(ADMIN_COOKIE)?.value
  const headerSecret = request.headers.get("x-admin-secret")
  const secret = process.env.ADMIN_SECRET

  if (cookieToken && verifyAdminToken(cookieToken)) {
    return null
  }

  if (secret && headerSecret === secret) {
    return null
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
