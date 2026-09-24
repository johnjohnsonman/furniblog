import { redirect } from "next/navigation"

export default async function ChairAIPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const params = new URLSearchParams({ mode: "chat" })
  if (q) params.set("q", q)
  redirect(`/chair-fit-calculator?${params.toString()}`)
}
