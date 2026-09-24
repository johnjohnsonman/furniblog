"use client"
import { useState, type ReactNode } from "react"
import { ChairFitCalculator } from "./chair-fit-calculator"
export function ChairFinderShell({ initialMode, initialQuery, children }: { initialMode?: string; initialQuery?: string; children: ReactNode }) {
  const [inQuestionnaire, setInQuestionnaire] = useState(false)
  return <><main><ChairFitCalculator initialMode={initialMode} initialQuery={initialQuery} onQuestionnaireChange={setInQuestionnaire} /></main>{!inQuestionnaire && children}</>
}
