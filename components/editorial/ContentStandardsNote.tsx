import Link from "next/link"

type ContentKind = "catalog" | "guide" | "comparison"

const COPY: Record<ContentKind, { label: string; text: string }> = {
  catalog: {
    label: "Catalog basis",
    text: "Product details combine manufacturer documentation, retailer listings and linked editorial coverage. Confirm the exact configuration, seller, price and availability before buying.",
  },
  guide: {
    label: "Research basis",
    text: "This guide synthesizes documented specifications, retailer information and published sources. It is not a hands-on Furniblog test unless the article explicitly says otherwise.",
  },
  comparison: {
    label: "Comparison basis",
    text: "This comparison uses documented specifications and published sources. Options can vary by market and configuration, so verify the selected listing before buying.",
  },
}

export function ContentStandardsNote({ kind }: { kind: ContentKind }) {
  const copy = COPY[kind]
  return (
    <aside className="mt-10 border-y border-border py-5 text-sm leading-relaxed text-muted-foreground">
      <p><strong className="font-medium text-foreground">{copy.label}:</strong>{" "}{copy.text}</p>
      <p className="mt-2 text-xs">
        Furniblog may earn from qualifying purchases at no extra cost to you. Our research and
        recommendations are not ranked by commission. Read our{" "}
        <Link href="/editorial-policy" className="underline underline-offset-2 hover:text-foreground">editorial policy</Link>{" "}
        and{" "}
        <Link href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-foreground">affiliate disclosure</Link>.
      </p>
    </aside>
  )
}
