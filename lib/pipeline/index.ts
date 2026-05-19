import { executeServerPipeline } from "@/lib/pipeline/server-run"
import type { PipelineOptions, PipelineResult } from "@/lib/pipeline/types"

export async function runPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const out = await executeServerPipeline({
    productId: options.productId,
    productSlug: options.chairSlug,
    productName: options.chairName,
    sources: (options.sources ?? []).filter((s) =>
      ["youtube", "naver", "dcinside", "trustpilot", "review_sites", "hackernews"].includes(s)
    ),
    allSources: options.sources,
    maxPerSource: options.maxPerSource,
  })

  return {
    collected: out.collected,
    processed: out.processed,
    saved: out.saved,
    failed: out.failed,
    results: [],
  }
}

export { executeServerPipeline } from "@/lib/pipeline/server-run"
