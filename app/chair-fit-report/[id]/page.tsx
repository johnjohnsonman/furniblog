import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { downloadSharedReport } from "@/lib/recommend/report-storage"
import { sharedReportSchema } from "@/lib/recommend/shared-report"
import { SharedChairReport } from "@/components/chair-fit/shared-chair-report"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Shared Chair Report | Chairpedia", robots: { index: false, follow: false }, referrer: "no-referrer" }
export default async function SharedReportPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params
  if(!/^[a-f0-9-]{36}$/.test(id))notFound()
  const data=await downloadSharedReport(id)
  if(!data)notFound()
  const parsed=sharedReportSchema.safeParse(data)
  if(!parsed.success||Date.parse(parsed.data.expiresAt)<=Date.now())notFound()
  return <SharedChairReport report={parsed.data} id={id}/>
}
