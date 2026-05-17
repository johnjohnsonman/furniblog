import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  getAdminSecret,
} from "@/lib/admin/auth"

export async function POST(request: NextRequest) {
  const secret = getAdminSecret()
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured" },
      { status: 503 }
    )
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body.password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions())
  return response
}
