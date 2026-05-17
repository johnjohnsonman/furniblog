import { cookies } from "next/headers"

export const ADMIN_COOKIE = "admin_token"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? ""
}

export function createAdminToken(): string {
  const secret = getAdminSecret()
  if (!secret) return ""
  return Buffer.from(`admin:${secret}`).toString("base64")
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false
  const expected = createAdminToken()
  return Boolean(expected) && token === expected
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  }
}
