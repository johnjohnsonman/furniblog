import { NextRequest } from "next/server"

export function verifyAdminSecret(request: NextRequest): boolean {
  const expected = process.env.ADMIN_SECRET
  if (!expected) return false

  const header =
    request.headers.get("x-admin-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")

  return header === expected
}
