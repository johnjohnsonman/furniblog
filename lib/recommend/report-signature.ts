import { createHmac, timingSafeEqual } from "node:crypto"
import { recommendationPayloadSchema } from "./finder-session"

export function signRecommendation(value: unknown) {
  const payload = recommendationPayloadSchema.omit({ signature: true }).parse(value)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("Sharing is not configured")
  return createHmac("sha256", key).update("chairpedia-report-v1:").update(JSON.stringify(payload)).digest("hex")
}
export function verifyRecommendation(value: unknown) {
  const parsed = recommendationPayloadSchema.safeParse(value)
  if (!parsed.success || !/^[a-f0-9]{64}$/.test(parsed.data.signature ?? "")) return false
  return timingSafeEqual(Buffer.from(parsed.data.signature!, "hex"), Buffer.from(signRecommendation(parsed.data), "hex"))
}
