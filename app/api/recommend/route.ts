import { NextRequest, NextResponse } from "next/server"
import { loadRecommenderData } from "@/lib/recommend/data"
import { recommend, type QuizAnswers } from "@/lib/recommend/engine"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const answers = (await request.json().catch(() => ({}))) as QuizAnswers
    const { products, affinity } = await loadRecommenderData()
    const results = recommend(products, affinity, answers, 5)
    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
