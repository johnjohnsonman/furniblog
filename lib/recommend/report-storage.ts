import { randomUUID } from "node:crypto"
import { reportBucket } from "./shared-report"
/** Private reports must bypass storage/CDN caches so revocation takes effect immediately. */
export async function downloadSharedReport(id: string): Promise<unknown | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !key) throw new Error("Report storage is not configured")
  const response = await fetch(`${base}/storage/v1/object/authenticated/${reportBucket}/reports/${id}.json?version=${randomUUID()}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key }, cache: "no-store",
  })
  if (!response.ok) return null
  return response.json()
}
