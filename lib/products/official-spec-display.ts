import { getOfficialSpecs, type OfficialSpecField, type OfficialSpecValue } from "./official-specs"

export type OfficialSpecRow = {
  field: OfficialSpecField
  label: string
  values: Array<{ text: string; scope?: string }>
  source: { url: string; title: string; checkedOn?: string }
}

const LABELS: Array<[OfficialSpecField, string]> = [
  ["sizes", "Sizes"],
  ["seatHeight", "Seat height"],
  ["seatDepth", "Seat depth"],
  ["seatWidth", "Seat width"],
  ["backHeight", "Back height"],
  ["weightCapacity", "Load capacity"],
  ["recline", "Recline"],
  ["arms", "Arms"],
  ["lumbar", "Lumbar support"],
  ["headrest", "Headrest"],
  ["warranty", "Warranty"],
  ["chairWeight", "Chair weight"],
]

/** Spec documents first, then the brand's product page, then its store. */
function sourceRank(v: OfficialSpecValue): number {
  const text = `${v.sourceTitle ?? ""} ${v.sourceUrl}`
  if (/spec|specification|product sheet|\.pdf/i.test(text)) return 3
  if (!/\/\/store\./i.test(v.sourceUrl)) return 2
  return 1
}

const valueText = (v: OfficialSpecValue) =>
  v.unit && v.unit !== "deg" && !v.value.includes(v.unit) ? `${v.value} ${v.unit}` : v.value

/**
 * Display rows for a chair in the official ledger: one source per field (the
 * highest-ranked; ties go to the source with the most entries), every value
 * from that source kept with its scope. Other sources stay in the ledger only.
 */
export function officialSpecRows(slug?: string | null): OfficialSpecRow[] {
  const specs = getOfficialSpecs(slug)
  if (!specs) return []
  const rows: OfficialSpecRow[] = []
  for (const [field, label] of LABELS) {
    const entries = (specs[field] ?? []).filter((v) => !v.displayExcluded && /\d|[A-Za-z]/.test(v.value))
    if (!entries.length) continue
    const bySource = new Map<string, OfficialSpecValue[]>()
    for (const v of entries) bySource.set(v.sourceUrl, [...(bySource.get(v.sourceUrl) ?? []), v])
    const [url, chosen] = [...bySource.entries()].sort(
      (a, b) => sourceRank(b[1][0]) - sourceRank(a[1][0]) || b[1].length - a[1].length
    )[0]
    rows.push({
      field,
      label,
      values: chosen.map((v) => ({ text: valueText(v), scope: v.scope })),
      source: { url, title: chosen[0].sourceTitle ?? url, checkedOn: chosen[0].checkedOn },
    })
  }
  return rows
}
