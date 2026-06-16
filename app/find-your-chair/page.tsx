import type { Metadata } from "next"
import { Quiz } from "./Quiz"

export const metadata: Metadata = {
  title: "Find Your Chair — The Sit Test | Furniblog",
  description:
    "Answer six quick questions and we'll match you to five chairs — cross-referenced against 1,600+ real reviews.",
}

export const dynamic = "force-dynamic"

export default function FindYourChairPage() {
  return <Quiz />
}
