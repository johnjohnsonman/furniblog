import type { OfficialSpecRow } from "@/lib/products/official-spec-display"

/** Specs from the official ledger, each row linked to the source it came from. */
export function OfficialSpecsTable({ rows, productName }: { rows: OfficialSpecRow[]; productName: string }) {
  return (
    <section aria-labelledby="official-specs-title">
      <h2 id="official-specs-title" className="font-serif text-xl font-medium text-foreground">Specifications</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        From {productName}&rsquo;s official specifications. Values that differ by size or option are listed separately; confirm the configuration you are buying.
      </p>
      <div className="mt-4 overflow-x-auto border border-[#171717]">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.field} className="border-t border-[#171717] first:border-t-0 align-top">
                <th scope="row" className="w-36 bg-[#f5f1e8] p-3 font-semibold sm:w-44">{row.label}</th>
                <td className="p-3">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
