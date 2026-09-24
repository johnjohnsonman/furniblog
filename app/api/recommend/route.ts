import { NextRequest, NextResponse } from "next/server"
import { loadRecommenderData } from "@/lib/recommend/data"
import { recommendWithProfile } from "@/lib/recommend/engine"
import { matchRecommendationShowrooms } from "@/lib/recommend/showrooms"
import { rankRecommendationResults } from "@/lib/recommend/ranking"
import { recommendationPayloadSchema } from "@/lib/recommend/finder-session"
import { signRecommendation } from "@/lib/recommend/report-signature"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  useCase: z
    .enum(["office", "executive", "gaming", "study", "standing", "lounge"])
    .optional(),
  maxPriceUsd: z.number().finite().min(0).max(1000000).optional(),
  keyboardTray: z.boolean().optional(),
  posture: z.enum(["upright", "move", "recline"]).optional(),
  budget: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  sitHours: z.enum(["under2", "2to6", "over6", "under4", "4to6", "6to8", "over8"]).optional(),
  pain: z.array(z.string().max(60)).max(8).optional(),
  style: z
    .enum(["minimal", "classic", "sporty", "premium", "ergonomic"])
    .optional(),
  material: z.enum(["mesh", "leather", "fabric"]).optional(),
  priorities: z
    .array(
      z.enum([
        "lumbar", "posture", "arms", "fourd", "recline", "tilt", "forward",
        "headrest", "neck", "seatdepth", "heightrange", "mesh", "cushioned",
        "leather", "tall", "petite", "bigtall", "light", "footrest", "design",
        "brand", "warranty", "value", "premium",
      ]),
    )
    .max(4)
    .optional(),
  heightCm: z.number().min(120).max(230).optional(),
  weightKg: z.number().min(30).max(250).optional(),
  deskHeightCm: z.number().min(45).max(140).optional(),
  armrestsUnderDesk: z.boolean().optional(),
  countryCode: z
    .string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((value) => value.toUpperCase())
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  seed: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  const startedAt = performance.now()
  try {
    const parsed = requestSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid calculator input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    const answers = parsed.data
    const { products, affinity } = await loadRecommenderData()
    const loadedAt = performance.now()
    const response = recommendWithProfile(products, affinity, answers, 10)
    const ranked = rankRecommendationResults(response.results)
    const rankedAt = performance.now()
    const showrooms = await matchRecommendationShowrooms(response.results, answers).catch(
      () => [],
    )
    const finishedAt = performance.now()
    const payload = recommendationPayloadSchema.parse({ ...response, ...ranked, showrooms })
    const signature = process.env.SUPABASE_SERVICE_ROLE_KEY ? signRecommendation(payload) : undefined
    return NextResponse.json({ ...response, ...ranked, showrooms, signature }, { headers: {
      "Cache-Control": "private, no-store",
      "Server-Timing": `catalog;dur=${(loadedAt - startedAt).toFixed(1)}, ranking;dur=${(rankedAt - loadedAt).toFixed(1)}, showrooms;dur=${(finishedAt - rankedAt).toFixed(1)}, total;dur=${(finishedAt - startedAt).toFixed(1)}`,
    } })
  } catch (error) {
    console.error(
      "Recommendation catalog request failed:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return NextResponse.json({ error: "Catalog data unavailable" }, { status: 503 })
  }
}
