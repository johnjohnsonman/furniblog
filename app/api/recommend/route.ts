import { NextRequest, NextResponse } from "next/server"
import { loadRecommenderData } from "@/lib/recommend/data"
import { recommendWithProfile } from "@/lib/recommend/engine"
import { matchRecommendationShowrooms } from "@/lib/recommend/showrooms"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  useCase: z
    .enum(["office", "executive", "gaming", "study", "standing", "lounge"])
    .optional(),
  budget: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  sitHours: z.enum(["under2", "2to6", "over6"]).optional(),
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
  try {
    const parsed = requestSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid calculator input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    const answers = parsed.data
    const { products, affinity } = await loadRecommenderData()
    const response = recommendWithProfile(products, affinity, answers, 5)
    const showrooms = await matchRecommendationShowrooms(response.results, answers).catch(
      () => [],
    )
    return NextResponse.json({ ...response, showrooms })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
