import { z } from "zod"
import { recommendationPayloadSchema } from "./finder-session"
export const reportBucket = "chair-fit-reports"
export const sharedReportSchema = z.object({
  version: z.literal(1), createdAt: z.string().datetime(), expiresAt: z.string().datetime(),
  includeMeasurements: z.boolean(), payload: recommendationPayloadSchema,
})
export type SharedReport = z.infer<typeof sharedReportSchema>
export function makeSharedReport(value: unknown, includeMeasurements: boolean, now = new Date()): SharedReport {
  const payload = recommendationPayloadSchema.omit({ signature: true }).parse(value)
  if (!includeMeasurements) {
    payload.profile = { suggestedSeatHeightCm: null, suggestedSeatDepthCm: null, deskSeatGapCm: null, notes: [] }
    const redact = (chair: typeof payload.results[number]) => ({ ...chair, alternativeReason: null, fit: { ...chair.fit,
      evidence: [], conflicts: [], unknowns: [],
      measurements: { seatHeightCm: null, seatDepthCm: null, seatWidthCm: null, capacityKg: null, armrestFloorHeightCm: null },
      components: { bodyHeight: null, seatHeight: null, seatDepth: null, weightCapacity: null, deskClearance: null },
    } })
    payload.results = payload.results.map(redact)
    payload.standouts = payload.standouts?.map(redact)
    payload.alternatives = payload.alternatives?.map(redact)
  }
  return { version: 1, createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(), includeMeasurements, payload }
}
