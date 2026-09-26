import { officialSpecRows, type OfficialSpecRow } from "@/lib/products/official-spec-display"

function Cell({ row }: { row?: OfficialSpecRow }) {
  if (!row) return <td className="p-3 text-muted-foreground">Not stated</td>
  return (
    <td className="p-3 align-top">
      <ul className="space-y-1">
        {row.values.map((v, i) => (
          <li key={i}>
            {v.text}
            {v.scope && <span className="ml-1 text-xs text-muted-foreground">({v.scope})</span>}
          </li>
        ))}
      </ul>
      <a href={row.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-muted-foreground underline underline-offset-2">
        {row.source.title} ↗
      </a>
    </td>
  )
}

/** Side-by-side specs for two chairs in the official ledger, each cell linked to its source. */
export function OfficialPairSpecTable({ a, b }: { a: { slug: string; name: string }; b: { slug: string; name: string } }) {
  const rowsA = officialSpecRows(a.slug), rowsB = officialSpecRows(b.slug)
  const fields = [...rowsA, ...rowsB].map((r) => r.field).filter((f, i, all) => all.indexOf(f) === i)
  if (!fields.length) return null
  return (
    <div className="my-8 overflow-x-auto border border-[#171717]" tabIndex={0} aria-label={`${a.name} and ${b.name} official specifications`}>
      <table className="w-full border-collapse text-left text-sm sm:min-w-[620px]">
        <thead>
          <tr className="bg-[#f5f1e8]">
            <th className="p-3">Official specs</th>
            <th className="p-3">{a.name}</th>
            <th className="p-3">{b.name}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const ra = rowsA.find((r) => r.field === field), rb = rowsB.find((r) => r.field === field)
            return (
              <tr key={field} className="border-t border-[#171717]">
                <th scope="row" className="p-3 align-top font-semibold">{(ra ?? rb)?.label}</th>
                <Cell row={ra} />
                <Cell row={rb} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
