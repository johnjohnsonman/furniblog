"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { SharedReport } from "@/lib/recommend/shared-report"
import { RecommendationResults } from "./chair-fit-calculator"
import "./chair-report.css"
export function SharedChairReport({ report, id }: { report: SharedReport; id: string }) {
  const [token,setToken]=useState<string|null>(null),[revoked,setRevoked]=useState(false),[message,setMessage]=useState("")
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(`chairpedia-share-${id}`)||"null");if(saved?.revokeToken)setToken(saved.revokeToken)}catch{}},[id])
  async function revoke(){setMessage("Turning off link...");try{const r=await fetch(`/api/chair-fit/reports/${id}`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({revokeToken:token})});if(!r.ok&&r.status!==404)throw Error();setRevoked(true);localStorage.removeItem(`chairpedia-share-${id}`)}catch{setMessage("Could not turn off the link. Please try again.")}}
  if(revoked)return <main className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-serif text-4xl">This share link is turned off.</h1><Link href="/chair-fit-calculator" className="mt-6 inline-block underline">Back to Chair Finder</Link></main>
  return <main className="fit-passport-page mx-auto max-w-6xl px-5 py-10">
    <p className="font-serif text-2xl">Chairpedia</p><p className="mt-5 text-xs uppercase tracking-[.16em] text-[#244f73]">Shared personal chair report</p>
    <h1 className="mt-4 font-serif text-4xl">A shortlist worth exploring.</h1>
    <p className="mt-4 max-w-3xl text-sm leading-6 text-[#575249]">This is a saved Chair Finder result shared by its owner, not a recommendation calculated for you. Prices, product details and trial locations may have changed since it was saved.</p>
    <p className="mt-3 text-xs text-[#777168]">Saved {report.createdAt.slice(0,10)} / Link expires {report.expiresAt.slice(0,10)} / {report.includeMeasurements ? "Measurement analysis included" : "Personal measurement analysis omitted"}</p>
    <div className="my-6 flex flex-wrap gap-3 print:hidden"><Link href="/chair-fit-calculator" className="inline-flex min-h-11 items-center bg-[#244f73] px-5 text-sm font-semibold text-white">Find my own chair matches</Link><button onClick={()=>window.print()} className="min-h-11 border border-[#8e887d] px-5 text-sm">Save as PDF</button>{token&&<button onClick={revoke} className="px-4 text-sm underline">Turn off this share link</button>}</div><p role="status">{message}</p>
    {report.includeMeasurements && <div className="my-6 grid gap-4 border-y border-[#c8c1b5] py-5 sm:grid-cols-2">{[["Suggested seat height",report.payload.profile.suggestedSeatHeightCm],["Suggested seat depth",report.payload.profile.suggestedSeatDepthCm]].map(([label,range])=><div key={String(label)}><p className="text-xs text-[#777168]">{String(label)}</p><p className="mt-2 font-serif text-2xl">{typeof range==='object'&&range?`${range.min} - ${range.max} cm`:"Not included"}</p></div>)}</div>}
    <RecommendationResults payload={report.payload} userProfile={report.payload.profile} failed={false} onRetry={()=>{}} includeMeasurements={report.includeMeasurements}/>
  </main>
}
