"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Ruler } from "lucide-react"
import { FitElevation } from "./fit-elevation"
import { buildFitProfile } from "@/lib/recommend/fit"
import type { Priority } from "@/lib/recommend/engine"

export type FinderAnswers = {
  height?: number; weight?: number; desk?: number; unknownDesk: boolean; underDesk: boolean;
  keyboardTray: boolean; posture: string; hours: string; concerns: string[];
  material: string; priorities: Priority[]; country: string; budget?: number;
  condition: string; shopping: string; unit: "metric" | "imperial";
}
export const initialFinderAnswers: FinderAnswers = {
  unknownDesk: false, desk: 72, underDesk: true, keyboardTray: false, posture: "", hours: "",
  concerns: [], material: "", priorities: [], country: "", condition: "new", shopping: "either", unit: "metric",
}
const countries = [["US", "United States", "USD"], ["CA", "Canada", "CAD"], ["GB", "United Kingdom", "GBP"], ["DE", "Germany", "EUR"], ["JP", "Japan", "JPY"], ["KR", "South Korea", "KRW"], ["AU", "Australia", "AUD"]]
const concerns = ["Lower back", "Neck and shoulders", "Hips and tailbone", "Legs and thigh pressure", "Arms and wrists", "No current concern"]
const features: [Priority, string][] = [["headrest", "Headrest"], ["recline", "Recline"], ["lumbar", "Lumbar support"], ["arms", "Adjustable arms"], ["seatdepth", "Seat-depth adjustment"], ["warranty", "Warranty"], ["value", "Value"], ["design", "Design"]]
const steps = ["Body", "Work", "Preferences", "Market"]

function Choices({ label, options, value, onChange }: { label: string; options: [string, string][]; value: string; onChange: (value: string) => void }) {
  return <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold">{label}</legend><div className={`grid grid-cols-2 gap-2 ${label === "Material" ? "sm:grid-cols-4" : ""}`}>{options.map(([key, title]) => <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)} className={`flex min-h-14 items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#244f73] ${value === key ? "border-[#244f73] bg-[#244f73] text-white" : "border-[#c9c2b6] bg-transparent text-[#292723] hover:border-[#244f73] hover:bg-[#e9e6dd]"}`}><span className={label === "Material" ? "w-full" : ""}>{label === "Material" && <span aria-hidden="true" className="mb-3 block h-6 w-full border border-current opacity-60" style={{ backgroundImage: key === "mesh" ? "repeating-linear-gradient(0deg,transparent,transparent 3px,currentColor 3px,currentColor 4px),repeating-linear-gradient(90deg,transparent,transparent 3px,currentColor 3px,currentColor 4px)" : key === "fabric" ? "repeating-linear-gradient(45deg,transparent,transparent 3px,currentColor 3px,currentColor 4px)" : key === "leather" ? "linear-gradient(135deg,currentColor 40%,transparent 40%,transparent 60%,currentColor 60%)" : "none" }} />}{title}</span>{value === key && <Check aria-hidden className="h-4 w-4 shrink-0" />}</button>)}</div></fieldset>
}

function Measure({ label, value, onChange, min, max, factor, unit, required = false }: { label: string; value?: number; onChange: (v: number | undefined) => void; min: number; max: number; factor: number; unit: string; required?: boolean }) {
  const display = (v: number) => Math.round(v / factor * 10) / 10
  return <label className="block"><span className="mb-3 flex items-center justify-between text-sm font-semibold">{label}<span className="font-normal text-[#777168]">{unit}</span></span><input aria-label={label} type="number" inputMode="decimal" step="any" required={required} min={Math.ceil(min / factor * 10) / 10} max={Math.floor(max / factor * 10) / 10} value={value === undefined ? "" : display(value)} onChange={e => onChange(e.target.value === "" ? undefined : Number(e.target.value) * factor)} placeholder={required ? "Enter your measurement" : "Optional"} className="min-h-14 w-full border border-[#aaa397] bg-[#faf8f3] px-4 text-2xl tabular-nums focus:outline-2 focus:outline-[#244f73]" /><input aria-label={`${label} slider`} type="range" min={Math.ceil(min / factor * 10) / 10} max={Math.floor(max / factor * 10) / 10} step="0.1" value={value === undefined ? display(min) : display(value)} onChange={e => onChange(Number(e.target.value) * factor)} className="mt-4 w-full accent-[#244f73]" /><span className="mt-1 flex justify-between text-xs text-[#777168]"><span>{display(min)} {unit}</span><span>{display(max)} {unit}</span></span></label>
}

export function FinderQuestionnaire({ answers: a, onChange, onSubmit, onExit, step, onStepChange }: { step: number; onStepChange: (step: number) => void; answers: FinderAnswers; onChange: (a: FinderAnswers) => void; onSubmit: () => void; onExit: () => void }) {
  const setStep = onStepChange
  const phase = [0,0,1,1,1,2,2,3,3,3][step]
  const titles = ["Start with your height.", "Add your weight, if you like.", "How high is your desk?", "What sits below your desk?", "How do you spend your day?", "Where would you like support?", "What matters in your chair?", "Where will you buy?", "What is your budget?", "How would you like to shop?"]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); heading.current?.focus({ preventScroll: true }) }, [step])
  const [measureHelp, setMeasureHelp] = useState(false)
  const patch = (data: Partial<FinderAnswers>) => onChange({ ...a, ...data })
  const profile = buildFitProfile({ heightCm: a.height, deskHeightCm: a.unknownDesk || a.keyboardTray ? undefined : a.desk })
  const factor = a.unit === "metric" ? 1 : 2.54
  const unit = a.unit === "metric" ? "cm" : "in"
  const currency = countries.find(c => c[0] === a.country)?.[2]
  const range = (v: { min: number; max: number } | null) => v ? `${(v.min / factor).toFixed(1)}–${(v.max / factor).toFixed(1)} ${unit}` : "Awaiting height"
  const toggleConcern = (value: string) => patch({ concerns: value === "No current concern" ? (a.concerns.includes(value) ? [] : [value]) : a.concerns.includes(value) ? a.concerns.filter(c => c !== value) : [...a.concerns.filter(c => c !== "No current concern"), value] })
  return <section className="bg-[#f4f0e8] text-[#292723]">
    <div className="mx-auto max-w-[1280px] px-5 pt-3 sm:px-8">
      <nav aria-label="Questionnaire progress" className="grid grid-cols-4 gap-2 border-b border-[#c9c2b6] pb-3">{steps.map((name, index) => <div key={name} aria-current={index === phase ? "step" : undefined} className={`border-t-2 pt-3 text-[10px] font-semibold uppercase tracking-[.12em] sm:text-xs ${index <= phase ? "border-[#244f73] text-[#244f73]" : "border-[#d6d0c5] text-[#918a7e]"}`}><span className="mb-1 block sm:mb-0 sm:mr-2 sm:inline">0{index + 1}</span>{name}</div>)}</nav>
      <div className="grid lg:grid-cols-[1fr_1.05fr]">
        <form onSubmit={e => { e.preventDefault(); if (step < 9) setStep(step + 1); else onSubmit(); window.scrollTo({ top: 0, behavior: "instant" }) }} className="min-w-0 pb-3 pt-4 lg:pr-10 lg:pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#244f73]">Step {step + 1} of 10 · {steps[phase]}</p>
          <h1 ref={heading} tabIndex={-1} className="outline-none mt-3 font-serif text-4xl leading-[1.08] tracking-[-.025em] sm:text-3xl">{titles[step]}</h1>
          <p className="mt-4 text-sm leading-6 text-[#6f695f]">{["Height sets your suggested seat-height and seat-depth ranges. Weight is optional.", "Your desk and working posture help identify the adjustments worth checking.", "Concerns and priorities help order matches. They never replace the physical fit checks.", "Choose your market and how you would like to shop. Location is never requested here."][phase]}</p>
          <div className="mt-5 space-y-4">
            {step === 0 && <>
              <Choices label="Measurements" options={[["metric", "Metric · cm / kg"], ["imperial", "Imperial · in / lb"]]} value={a.unit} onChange={v => patch({ unit: v as FinderAnswers["unit"] })} />
              <Measure label="Height" value={a.height} onChange={height => patch({ height })} min={120} max={230} factor={factor} unit={unit} required />
              <p className="text-xs leading-5 text-[#777168]">Move the slider or type your height. No average height is entered for you.</p>
            </>}
            {step === 1 && <>
              <Measure label="Weight (optional)" value={a.weight} onChange={weight => patch({ weight })} min={30} max={250} factor={a.unit === "metric" ? 1 : .45359237} unit={a.unit === "metric" ? "kg" : "lb"} />
              <p className="text-xs leading-5 text-[#777168]">Used to check published weight capacity. Leave blank to skip this check.</p>
            </>}
            {step === 2 && <>
              <Choices label="Do you know your desk height?" options={[["known", "Enter desk height"], ["unknown", "I don't know"]]} value={a.unknownDesk ? "unknown" : "known"} onChange={v => patch({ unknownDesk: v === "unknown" })} />
              {!a.unknownDesk && <Measure label="Desk height · floor to surface" value={a.desk} onChange={desk => patch({ desk })} min={45} max={140} factor={factor} unit={unit} required />}
              <button type="button" onClick={() => setMeasureHelp(!measureHelp)} aria-expanded={measureHelp} className="inline-flex min-h-11 items-center gap-2 text-sm text-[#244f73] underline underline-offset-4"><Ruler className="h-4 w-4" />How to measure (15 s)</button>
              {measureHelp && <p className="border-l-2 border-[#244f73] pl-4 text-sm leading-6">Measure vertically from the floor to the top of your desk. Check the underside separately for drawers, support rails and the actual space your armrests can use.</p>}
            </>}
            {step === 3 && <>
              <Choices label="Armrests under the desk" options={[["yes", "Must fit underneath"], ["no", "Not required"]]} value={a.underDesk ? "yes" : "no"} onChange={v => patch({ underDesk: v === "yes" })} />
              <Choices label="Do you use a keyboard tray?" options={[["yes", "I use a keyboard tray"], ["no", "No keyboard tray"]]} value={a.keyboardTray ? "yes" : "no"} onChange={v => patch({ keyboardTray: v === "yes" })} />
              {a.keyboardTray && <p className="text-xs leading-5 text-[#777168]">Your keyboard surface differs from the desktop. We keep the body-based seat range and leave tray clearance unconfirmed.</p>}
            </>}
            {step === 4 && <>
              <Choices label="How do you sit?" options={[["upright", "Mostly upright"], ["move", "Move throughout the day"], ["recline", "Recline often"], ["", "No preference"]]} value={a.posture} onChange={posture => patch({ posture })} />
              <Choices label="Daily sitting time" options={[["under4", "Under 4 h"], ["4to6", "4–6 h"], ["6to8", "6–8 h"], ["over8", "8+ h"]]} value={a.hours} onChange={hours => patch({ hours })} />
            </>}
            {step === 5 && <>
              <fieldset><legend className="mb-3 text-sm font-semibold">Where would you like more support?</legend><div className="grid grid-cols-[76px_1fr] gap-4 sm:grid-cols-[100px_1fr]">
                <svg viewBox="0 0 100 270" aria-hidden="true" className="mt-3 w-full text-[#777168]"><circle cx="50" cy="22" r="13" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M35 38 Q19 40 17 65 L8 135 Q8 147 17 146 L26 98 L25 160 L30 249 Q31 260 45 256 L50 177 L55 256 Q68 260 70 249 L75 160 L74 98 L83 146 Q93 147 92 135 L83 65 Q81 40 65 38" fill="none" stroke="currentColor" strokeWidth="1.5" />{[[50,52],[50,113],[50,147],[50,198],[15,130]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="11" fill={a.concerns.includes(concerns[[1,0,2,3,4][i]]) ? "#244f73" : "#e9e4da"} stroke="#aaa397" />)}</svg>
                <div>{concerns.map(c => <button key={c} type="button" aria-pressed={a.concerns.includes(c)} onClick={() => toggleConcern(c)} className={`flex min-h-12 w-full items-center gap-3 border border-b-0 border-[#c9c2b6] px-3 py-3 text-left text-sm last:border-b ${a.concerns.includes(c) ? "bg-[#244f73] text-white" : "hover:bg-[#e9e6dd]"}`}><span className="grid h-4 w-4 shrink-0 place-items-center border border-current">{a.concerns.includes(c) && <Check className="h-3 w-3" />}</span>{c}</button>)}</div>
              </div><p className="mt-3 text-xs leading-5 text-[#777168]">This prioritizes chair features, not treatment or a promise of pain relief.</p></fieldset>
            </>}
            {step === 6 && <>
              <Choices label="Material" options={[["mesh", "Mesh"], ["fabric", "Fabric"], ["leather", "Leather"], ["", "No preference"]]} value={a.material} onChange={material => patch({ material })} />
              <fieldset><legend className="mb-3 text-sm font-semibold">Priority features <span className="ml-3 font-normal text-[#777168]">{a.priorities.length} of 10</span></legend><div className="flex flex-wrap gap-2">{features.map(([key,label]) => <button key={key} type="button" aria-pressed={a.priorities.includes(key)} disabled={!a.priorities.includes(key) && a.priorities.length >= 4} onClick={() => patch({ priorities: a.priorities.includes(key) ? a.priorities.filter(p => p !== key) : [...a.priorities,key] })} className={`min-h-11 border px-4 py-2 text-sm disabled:opacity-40 ${a.priorities.includes(key) ? "border-[#244f73] bg-[#244f73] text-white" : "border-[#c9c2b6] hover:border-[#244f73]"}`}>{label}</button>)}</div></fieldset>
            </>}
            {step === 7 && <>
              <Choices label="Country" options={[["", "No country selected"], ...countries.map(c => [c[0],c[1]] as [string,string])]} value={a.country} onChange={country => patch({ country, budget: undefined })} />
            </>}
            {step === 8 && <>
              <label className="block text-sm font-semibold">Budget {currency ? `in ${currency}` : "(choose a country first)"}<input aria-label="Budget" type="number" inputMode="decimal" min="0" step="any" disabled={!currency} value={a.budget ?? ""} onChange={e => patch({ budget: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Optional maximum" className="mt-3 min-h-14 w-full border border-[#aaa397] bg-[#faf8f3] px-4 text-xl disabled:opacity-40" /></label>
              <p className="text-xs leading-5 text-[#777168]">{a.country === "US" ? "Known US list prices above your budget are excluded. Unknown prices remain unconfirmed; retailer prices can change." : "Local prices are not verified for this market. Your budget is saved in the summary; it does not filter these matches."}</p>
            </>}
            {step === 9 && <>
              <Choices label="Condition" options={[["new", "New only"], ["used", "Used is acceptable"]]} value={a.condition} onChange={condition => patch({ condition })} />
              <Choices label="How you want to buy" options={[["online", "Shop online"], ["showroom", "Try in a showroom"], ["either", "Either"]]} value={a.shopping} onChange={shopping => patch({ shopping })} />
              <p className="text-xs leading-5 text-[#777168]">Condition is a buying preference, not a verified stock filter. Showrooms use your selected country. We do not request your location here.</p>
            </>}
          </div>
          <div className="sticky bottom-0 z-10 bg-[#f4f0e8] mt-5 flex items-center gap-4 border-t border-[#aaa397] py-3"><button type="submit" className="inline-flex min-h-12 items-center gap-6 bg-[#244f73] px-6 text-sm font-semibold text-white hover:bg-[#193a55]">{step === 9 ? "Calculate my fit" : "Continue"}<ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => step === 0 ? onExit() : setStep(step - 1)} className="inline-flex min-h-12 items-center gap-2 px-3 text-sm"><ArrowLeft className="h-4 w-4" />Back</button><span className="ml-auto text-xs tabular-nums text-[#777168]">{step + 1} / 10</span></div>
        </form>
        <aside className="min-w-0 border-t border-[#c9c2b6] pb-8 lg:border-l lg:border-t-0 lg:pb-0 lg:pl-8"><div className="mx-auto max-w-[430px] py-4 lg:sticky lg:top-20 lg:py-5"><div className="border border-[#c9c2b6]"><div className="flex justify-between border-b border-[#c9c2b6] px-4 py-3 text-[9px] uppercase tracking-[.14em] text-[#777168]"><span>Body · chair · desk</span><span>Illustrative proportions</span></div><FitElevation height={a.height ?? 172} desk={a.unknownDesk ? undefined : a.desk} keyboardTray={a.keyboardTray} active={phase === 1 ? "desk" : "seat"} /></div><div aria-live="polite" className="border-x border-b border-[#c9c2b6] p-5"><p className="text-[9px] uppercase tracking-[.15em] text-[#777168]">Live readout</p>{a.height ? <dl className="mt-4 grid grid-cols-2 gap-4"><div><dt className="text-xs text-[#777168]">Seat height</dt><dd className="mt-1 font-serif text-xl">{range(profile.suggestedSeatHeightCm)}</dd></div><div><dt className="text-xs text-[#777168]">Seat depth</dt><dd className="mt-1 font-serif text-xl">{range(profile.suggestedSeatDepthCm)}</dd></div></dl> : <p className="mt-3 text-sm">Enter your height to see suggested ranges. The illustration is a sample.</p>}<p className="mt-4 text-xs leading-5 text-[#777168]">{a.unknownDesk ? "Desk clearance unknown." : a.keyboardTray ? "Keyboard tray clearance needs a separate measurement." : "Check the underside of your desk before relying on armrest clearance."}</p></div></div></aside>
      </div>
    </div>
  </section>
}
