"use client"

import { useEffect, useRef, useState } from "react"
import type { FitInputs } from "@/lib/recommend/fit"
import type { evaluateConfiguration } from "@/lib/recommend/configurations"

type Result = ReturnType<typeof evaluateConfiguration>
type Configuration = Result["configuration"]

export function ConfigurationCheck({ slug, inputs }: { slug: string; inputs: FitInputs }) {
  const [opened, setOpened] = useState(false)
  const [market, setMarket] = useState("")
  const [rows, setRows] = useState<Configuration[] | null>(null)
  const [selection, setSelection] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])

  function reset() {
    request.current?.abort()
    request.current = null
    setBusy(false)
    setError("")
    setRows(null)
    setSelection("")
    setResult(null)
  }

  async function load(check: boolean) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError("")
    setResult(null)
    if (!check) { setRows(null); setSelection("") }
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(check ? "/api/chair-fit/configurations" : `/api/chair-fit/configurations?product=${encodeURIComponent(slug)}&market=${market}`, {
        method: check ? "POST" : "GET",
        cache: "no-store",
        signal: controller.signal,
        ...(check ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...inputs, market, configurationId: selection }) } : {}),
      })
      if (!response.ok) throw new Error("Unavailable")
      const data = await response.json()
      if (request.current !== controller) return
      if (check) setResult(data as Result)
      else setRows(data.configurations as Configuration[])
    } catch {
      if (request.current === controller) setError("This configuration check is temporarily unavailable. Please try again.")
    } finally {
      window.clearTimeout(timeout)
      if (request.current === controller) setBusy(false)
    }
  }

  const control = "mt-2 min-h-11 w-full min-w-0 border border-[#aaa397] bg-white px-3 text-sm"
  return (
    <section className="mt-6 min-w-0 border-t border-[#c8c1b5] pt-5 text-sm text-[#575249]">
      <button type="button" aria-expanded={opened} onClick={() => setOpened(!opened)} className="min-h-11 text-left font-semibold text-[#244f73] underline underline-offset-4">Check a specific configuration</button>
      {opened && <div className="space-y-4">
        <p className="text-xs leading-5">Dimensions can vary by country and options. Choose the market where you plan to buy, then check a verified configuration against your measurements.</p>
        <form onSubmit={event => { event.preventDefault(); void load(false) }}>
          <label className="block">Purchase market (two-letter country code)
            <input className={control} value={market} placeholder="For example, US or KR" required pattern="[A-Za-z]{2}" maxLength={2} autoCapitalize="characters" onChange={event => { reset(); setMarket(event.target.value.toUpperCase()) }} />
          </label>
          <button disabled={busy || !/^[A-Z]{2}$/.test(market)} className="mt-3 min-h-11 border border-[#8e887d] px-4 disabled:opacity-50">Find verified configurations</button>
        </form>
        {busy && <p role="status">Checking published configuration records...</p>}
        {error && <p role="alert" className="text-[#8a5a20]">{error}</p>}
        {rows?.length === 0 && <p role="status" className="border-l-2 border-[#aaa397] pl-3 text-xs leading-5">No verified configuration is available for this chair in {market} yet. This does not mean the chair is unavailable in that market. Confirm the exact options with the seller.</p>}
        {!!rows?.length && <form onSubmit={event => { event.preventDefault(); void load(true) }}>
          <label className="block">Verified configuration
            <select className={control} required value={selection} onChange={event => { request.current?.abort(); request.current = null; setBusy(false); setError(""); setResult(null); setSelection(event.target.value) }}>
              <option value="">Choose a configuration</option>
              {rows.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}
            </select>
          </label>
          <button disabled={busy || !selection} className="mt-3 min-h-11 bg-[#244f73] px-4 text-white disabled:opacity-50">Check this configuration</button>
        </form>}
        {result && <div role="status" className="space-y-3 border border-[#c8c1b5] p-4 [overflow-wrap:anywhere]">
          <h4 className="font-semibold text-[#292723]">{result.configuration.label}</h4>
          <p>Configuration Fit Score: <strong>{result.fit.score}/100</strong></p>
          <p className="text-xs">A fit index, not a probability. This separate check does not change your shortlist order. Confidence: {result.fit.confidence}.</p>
          {([["Supports", result.fit.evidence], ["Check before choosing", result.fit.conflicts], ["Unknown measurements", result.fit.unknowns]] as const).map(([title, items]) => <div key={title}><h5 className="font-semibold">{title}</h5>{items.length ? <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5">{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="text-xs">None recorded in this check.</p>}</div>)}
          <a className="block text-xs text-[#244f73] underline" href={result.configuration.source_url} target="_blank" rel="noreferrer">{result.configuration.source_title}</a>
          <p className="text-xs">Source checked {result.configuration.checked_on}</p>
          {result.configuration.notes && <p className="text-xs leading-5">{result.configuration.notes}</p>}
        </div>}
      </div>}
    </section>
  )
}
