"use client"
import { useState } from "react"
import { Share2 } from "lucide-react"
import type { RecommendationPayload } from "./chair-fit-calculator"
type LinkState = { id: string; url: string; expiresAt: string; revokeToken: string }
export function ShareReport({ payload, onRefresh }: { payload: RecommendationPayload; onRefresh: () => void }) {
  const [open, setOpen] = useState(false), [include, setInclude] = useState(false)
  const [link, setLink] = useState<LinkState | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState("")
  async function create() {
    setBusy(true); setMessage("")
    try {
      const response = await fetch("/api/chair-fit/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, includeMeasurements: include }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not create a share link.")
      setLink(result)
      try { localStorage.setItem(`chairpedia-share-${result.id}`, JSON.stringify(result)) } catch { /* Current view still supports revocation. */ }
      setMessage("Link created. Anyone with this link can read the shared report for 30 days.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again.") } finally { setBusy(false) }
  }
  async function revoke() {
    if (!link) return
    setBusy(true)
    try {
      const response = await fetch(`/api/chair-fit/reports/${link.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revokeToken: link.revokeToken }) })
      if (!response.ok && response.status !== 404) throw new Error("Could not turn off the link. Please try again.")
      try { localStorage.removeItem(`chairpedia-share-${link.id}`) } catch {}
      setLink(null); setMessage("The link is now turned off.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again.") } finally { setBusy(false) }
  }
  return <div className="print:hidden">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex min-h-11 items-center gap-2 border border-[#8e887d] px-5 text-sm font-semibold text-[#244f73]"><Share2 className="h-4 w-4" />Share report</button>
    {open && <div className="mt-4 max-w-xl border border-[#c8c1b5] bg-[#f8f5ef] p-5 text-sm">
      <h2 className="font-serif text-2xl">Choose what you share</h2>
      <p className="mt-3 leading-6 text-[#575249]">Your shortlist, fit scores and recommendation badges will be shared. Personal measurement analysis is excluded by default. Links expire after 30 days.</p>
      {!payload.signature && <div className="my-4"><p className="leading-6">This report was saved before sharing was available. Refresh the matches to enable sharing; your answers will be kept.</p><button type="button" onClick={onRefresh} className="mt-3 min-h-11 border border-[#8e887d] px-4">Refresh report for sharing</button></div>}
      {payload.signature && !link && <><label className="my-4 flex items-start gap-3 leading-6"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#244f73]" checked={include} onChange={e=>setInclude(e.target.checked)} />Include suggested measurement ranges and personal fit checks</label><button type="button" disabled={busy} onClick={create} className="min-h-11 bg-[#244f73] px-4 font-semibold text-white disabled:opacity-50">{busy ? "Creating link..." : "Create share link"}</button></>}
      {link && <div className="mt-4 space-y-3"><label className="block">Share link<input readOnly value={link.url} onFocus={e=>e.target.select()} className="mt-2 w-full border border-[#c8c1b5] bg-white p-3" /></label><div className="flex flex-wrap gap-3"><button type="button" className="min-h-11 border border-[#8e887d] px-4" onClick={async()=>{try { await navigator.clipboard.writeText(link.url); setMessage("Link copied.") } catch { setMessage("Select and copy the link above.") }}}>Copy link</button><button type="button" disabled={busy} className="min-h-11 px-4 underline" onClick={revoke}>Turn off link</button></div><p className="text-xs">You can also turn this link off from its shared page in this browser.</p></div>}
      <p role="status" className="mt-3 leading-6 text-[#575249]">{message}</p>
    </div>}
  </div>
}
