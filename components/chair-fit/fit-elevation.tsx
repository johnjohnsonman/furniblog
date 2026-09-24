import { buildFitProfile } from "@/lib/recommend/fit"

// Recreates the supplied HTML's chair/person silhouette with live catalog-profile ranges.
export function FitElevation({ height, desk, active, keyboardTray }: { height: number; desk?: number; active: string; keyboardTray?: boolean }) {
  const profile = buildFitProfile({ heightCm: height, deskHeightCm: desk, keyboardTray })
  const seat = 224 - (height - 172) * 0.45
  const surface = 318 - (desk ?? 72) * 2.1
  const range = (value: { min: number; max: number } | null) => value ? `${value.min}–${value.max} cm` : "Not entered"
  return <svg viewBox="0 0 480 340" className="block w-full" fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Illustrative side elevation of a seated person, adjustable chair and desk">
    <defs><pattern id="fit-elevation-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" stroke="#ddd6ca" strokeWidth="0.7" /></pattern></defs>
    <rect width="480" height="340" fill="url(#fit-elevation-grid)" />
    <line x1="16" y1="318" x2="476" y2="318" stroke="#777168" strokeWidth="1.5" />
    <rect x="280" y={surface} width="188" height="5" fill="#292723" />
    <line x1="458" y1={surface} x2="458" y2="318" stroke="#292723" strokeWidth="2" />
    <line x1="475" y1={surface} x2="475" y2="318" stroke={active === "desk" ? "#244f73" : "#a29d92"} strokeDasharray="3 4" />
    <text x="462" y={surface - 12} fill="#575249" fontSize="14" textAnchor="end">{desk ? `${desk} cm desk` : "Desk height not entered"}</text>
    <path d={`M176 ${seat} L168 ${seat-108}`} stroke="#292723" strokeWidth="4" />
    <rect x="176" y={seat} width="95" height="7" fill="#292723" />
    <line x1="224" y1={seat+7} x2="224" y2="314" stroke="#292723" strokeWidth="3" />
    <path d="M178 318v-4h92v4" stroke="#292723" strokeWidth="2" />
    <line x1="210" y1={seat} x2="210" y2={seat-46} stroke="#292723" strokeWidth="2" />
    <rect x="192" y={seat-46} width="54" height="5" fill="#292723" />
    <path d={`M178 ${seat-118} L186 ${seat-6} L274 ${seat-8} L283 318 M178 ${seat-118} L197 ${seat-59} L254 ${seat-59}`} stroke="#244f73" strokeWidth="2.5" />
    <circle cx="176" cy={seat-143} r="20" stroke="#244f73" strokeWidth="2.5" />
    <g opacity={active === "seat" ? 1 : .4}>
      <rect x="140" y={seat-6} width="18" height="12" fill="#244f73" fillOpacity=".15" stroke="#244f73" />
      <line x1="149" y1={seat} x2="149" y2="318" stroke="#244f73" />
      <text x="134" y={seat+3} textAnchor="end" fill="#244f73" fontSize="15" fontWeight="600">{range(profile.suggestedSeatHeightCm)}</text>
      <text x="134" y={seat+20} textAnchor="end" fill="#244f73" fontSize="15">SEAT HEIGHT</text>
    </g>
    <g opacity={active === "depth" ? 1 : .4}>
      <rect x="251" y={seat+22} width="20" height="10" fill="#244f73" fillOpacity=".15" stroke="#244f73" />
      <line x1="176" y1={seat+27} x2="271" y2={seat+27} stroke="#244f73" />
      <text x="176" y={seat+49} fill="#244f73" fontSize="15" fontWeight="600">{range(profile.suggestedSeatDepthCm)}</text>
      <text x="176" y={seat+66} fill="#244f73" fontSize="15">SEAT DEPTH</text>
    </g>
  </svg>
}

