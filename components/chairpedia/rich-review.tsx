import Link from "next/link"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import type { RichReview, DataTier } from "@/lib/chairpedia/rich-types"
import type { ProductImages } from "@/lib/amazon/paapi"
import type { ResolvedGallery } from "@/lib/data/product-images"

const ACCENT = "oklch(0.60 0.12 25)"

/** Wrap authored <table>s so wide tables scroll on mobile (inside .chairpedia-body). */
function wrapTables(html: string): string {
  return html
    .replace(/<table(\s[^>]*)?>/gi, '<div class="cp-table-scroll"><table$1>')
    .replace(/<\/table>/gi, "</table></div>")
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  )
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-foreground">
      {children}
    </h2>
  )
}

function statusLabel(tier: DataTier): string {
  return tier === "C" ? "Not confirmed" : tier === "B" ? "Manufacturer-documented" : "Confirmed"
}

export function RichReview({
  data,
  title,
  contentHtml,
  images,
  productImages,
  heroImageUrl,
  amazonUrl,
  productSlug,
  productName,
  updatedStr,
}: {
  data: RichReview
  title: string
  contentHtml: string
  /** PA-API images (auto, once the account is eligible); null otherwise. */
  images: ProductImages | null
  /** Linked product's own images (reused across the site); null if none. */
  productImages?: ResolvedGallery | null
  /** Manual hero image (admin upload) — used when nothing else resolves. */
  heroImageUrl?: string | null
  amazonUrl: string | null
  productSlug?: string
  productName?: string
  updatedStr: string | null
}) {
  // Image resolution: PA-API (auto) → linked product's own images (reused) →
  // manual hero upload → none (no placeholder). Alt from registry/derived.
  const paapiGallery =
    images?.variants?.slice(0, 4).map((url) => ({ url, alt: productName ?? data.buy.productTitle })) ?? []
  const heroSrc = images?.primary ?? productImages?.hero?.url ?? heroImageUrl ?? null
  const heroAlt = productImages?.hero?.alt ?? productName ?? data.buy.productTitle
  const gallery: { url: string; alt: string }[] =
    paapiGallery.length > 0 ? paapiGallery : productImages?.gallery ?? []

  const cta = amazonUrl ? (
    <SmartBuyLink
      variant="inline"
      productId={productSlug}
      name={productName ?? data.buy.productTitle}
      amazonUrl={amazonUrl}
      amazonLabel={data.buy.ctaLabel ?? "Check price on Amazon"}
    />
  ) : null

  const heroText = (
    <div className="flex flex-col gap-5">
      <Eyebrow>{data.eyebrow}</Eyebrow>
      <h1 className="font-serif text-3xl md:text-[42px] md:leading-[1.15] font-medium tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-lg leading-relaxed max-w-xl">{data.heroIntro}</p>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 items-start border border-border bg-card p-4 max-w-xl">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground pt-1">
          In short
        </span>
        <div className="font-serif text-lg leading-snug">{data.verdictOneLiner}</div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          By the{" "}
          <Link href="/about" className="font-medium text-foreground hover:underline">
            Furniblog Editorial Team
          </Link>
        </span>
        {updatedStr && <span>· Updated {updatedStr}</span>}
        <span className="inline-flex items-center gap-1.5">
          ·
          <span className="inline-block h-2 w-2 rounded-full" style={{ border: `1.5px solid ${ACCENT}` }} />
          {data.verdictNote}
        </span>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="flex flex-col gap-3 max-w-xl">
        <div className="flex flex-wrap gap-3">
          {cta}
          <a
            href="#dimensions"
            className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            Check dimensions &amp; fit <span className="opacity-55">↓</span>
          </a>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Furniblog participates in the Amazon Associates program. We may earn a commission on
          qualifying purchases at no extra cost to you. Price, seller and stock are shown live on
          Amazon and are not verified by Furniblog.
        </p>
      </div>
    </div>
  )

  return (
    <div className="font-sans text-foreground">
      {/* ── Hero ── */}
      {heroSrc ? (
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          {heroText}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={heroAlt}
              className="w-full aspect-[4/3] object-contain border border-border bg-card"
            />
            {gallery.length > 0 && (
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {gallery.map((g, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={g.url}
                    alt={g.alt}
                    loading="lazy"
                    className="w-full aspect-square object-contain border border-border bg-card"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        heroText
      )}

      {/* ── Quick facts (Tier A) ── */}
      <div className="mt-10 border-y border-border bg-muted px-5 py-6 -mx-4 md:mx-0 md:px-6">
        <div className="mb-4 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <span className="font-semibold">Quick facts</span> ·{" "}
          {data.quickFactsNote ?? `Confirmed on the Amazon listing we link (ASIN ${data.asin ?? "—"})`}
        </div>
        <div className="grid grid-cols-2 gap-x-7 gap-y-4 md:grid-cols-5">
          {data.quickFacts.map((f) => (
            <div key={f.label} className="flex flex-col gap-1 min-w-0">
              <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{f.label}</div>
              <div className="font-serif text-lg md:text-xl leading-tight">{f.value}</div>
              {f.note && <div className="text-xs leading-snug text-muted-foreground">{f.note}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-16 max-w-3xl">
        {/* ── 5 checks ── */}
        <section id="verify" className="flex flex-col gap-5">
          <Eyebrow>Before you buy</Eyebrow>
          <SectionH2>{data.checksTitle ?? "Check these before you buy"}</SectionH2>
          {data.checksIntro && (
            <p className="text-base leading-relaxed">{data.checksIntro}</p>
          )}
          <div className="flex flex-col border-t border-border">
            {data.checks.map((c) => (
              <div key={c.n} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 border-b border-border py-5">
                <div className="text-sm font-semibold pt-0.5">{c.n}</div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="text-base font-medium leading-snug">{c.title}</div>
                  <div className="text-[15px] leading-relaxed">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dimensions ── */}
        <section id="dimensions" className="flex flex-col gap-5">
          <Eyebrow>Dimensions &amp; fit</Eyebrow>
          <SectionH2>Dimensions and fit</SectionH2>
          <p className="text-base leading-relaxed">
            {data.dimsIntro ??
              "Manufacturer figures come from the maker's official product page; we check them against the Amazon listing before treating them as confirmed. Values we can't confirm for the linked listing are marked as such — take those from the listing you buy from."}
          </p>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {data.dims.map((d) => (
              <div key={d.k} className="border border-border bg-card p-4 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] font-medium">{d.k}</span>
                  <span
                    className="text-[11px] font-medium whitespace-nowrap"
                    style={{ color: d.tier === "C" ? ACCENT : undefined }}
                  >
                    <span className={d.tier !== "C" ? "text-muted-foreground" : undefined}>{statusLabel(d.tier)}</span>
                  </span>
                </div>
                <div className={`text-sm leading-relaxed ${d.tier === "C" ? "text-muted-foreground" : ""}`}>{d.v}</div>
              </div>
            ))}
          </div>

          {/* Desktop: table (scrolls within its own container if narrow) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-border bg-card text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Measurement</th>
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Documented value</th>
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.dims.map((d) => (
                  <tr key={d.k} className="border-b border-border align-top">
                    <td className="p-3.5 text-sm font-medium leading-snug w-[26%]">{d.k}</td>
                    <td className={`p-3.5 text-sm leading-snug ${d.tier === "C" ? "text-muted-foreground" : ""}`}>{d.v}</td>
                    <td className="p-3.5 text-xs font-medium leading-snug w-[24%]" style={{ color: d.tier === "C" ? ACCENT : undefined }}>
                      <span className={d.tier !== "C" ? "text-muted-foreground" : undefined}>{statusLabel(d.tier)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{data.dimsSourceNote}</p>
        </section>

        {/* ── Adjustable vs fixed ── */}
        <section id="adjustments" className="flex flex-col gap-5">
          <Eyebrow>Adjustability</Eyebrow>
          <SectionH2>Adjustable vs fixed</SectionH2>
          <div className="grid gap-8 md:grid-cols-2">
            <SpecColumn title="Adjustable" rows={data.adjustable} />
            <SpecColumn title="Fixed or limited" rows={data.fixed} />
          </div>
        </section>

        {/* ── In-depth (reuse full research body) ── */}
        <section id="review" className="flex flex-col gap-5">
          <Eyebrow>In depth</Eyebrow>
          <SectionH2>Design, ergonomics &amp; build — in depth</SectionH2>
          <div className="chairpedia-body min-w-0" dangerouslySetInnerHTML={{ __html: wrapTables(contentHtml) }} />
        </section>

        {/* ── Strengths / cautions ── */}
        <section id="assessment" className="flex flex-col gap-5">
          <Eyebrow>From published reviews</Eyebrow>
          <SectionH2>Strengths and cautions</SectionH2>
          <p className="text-base leading-relaxed">
            Drawn from manufacturer documentation and published reviews, not from our own use. Each
            point names its basis.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <BasisCard title="Strengths" items={data.pros} />
            <BasisCard title="Cautions" items={data.cons} />
          </div>
        </section>

        {/* ── Who it's for ── */}
        <section id="fit" className="flex flex-col gap-5">
          <Eyebrow>Is it for you?</Eyebrow>
          <SectionH2>Who it&apos;s for, and who should skip it</SectionH2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold">{data.forWhoTitle ?? "This chair shines for"}</div>
              {data.forWho.map((w, i) => (
                <div key={i} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2.5 text-[15px] leading-relaxed">
                  <span>✓</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold">Consider alternatives if you</div>
              {data.skipWho.map((w, i) => (
                <div key={i} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2.5 text-[15px] leading-relaxed">
                  <span>—</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Rivals ── */}
        <section id="alternatives" className="flex flex-col gap-5">
          <Eyebrow>Alternatives</Eyebrow>
          <SectionH2>Comparisons with key rivals</SectionH2>
          <p className="text-base leading-relaxed">
            Rival figures are from published sources and are not verified by Furniblog. Prices move
            constantly, so we link out instead of printing a number.
          </p>
          <p className="text-xs text-muted-foreground md:hidden">Scroll the table sideways to compare →</p>
          <div className="overflow-x-auto">
            <table className="w-full border border-border bg-card text-left" style={{ minWidth: 560 }}>
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Model</th>
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Lumbar</th>
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Armrests</th>
                  <th className="p-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Standout</th>
                </tr>
              </thead>
              <tbody>
                {data.rivals.map((r) => (
                  <tr key={r.name} className={`border-b border-border align-top ${r.isSelf ? "bg-muted" : ""}`}>
                    <td className="p-3.5 text-sm font-medium leading-snug">{r.name}</td>
                    <td className="p-3.5 text-[13.5px] leading-snug">{r.lumbar}</td>
                    <td className="p-3.5 text-[13.5px] leading-snug">{r.arms}</td>
                    <td className="p-3.5 text-[13.5px] leading-snug">{r.standout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Verdict ── */}
        <section id="verdict" className="flex flex-col gap-5">
          <Eyebrow>Research-based editorial</Eyebrow>
          <SectionH2>The bottom line</SectionH2>
          {data.verdict.map((p, i) => (
            <p key={i} className="text-base leading-relaxed">{p}</p>
          ))}
          <blockquote className="font-serif text-xl leading-snug pl-5 py-1" style={{ borderLeft: `2px solid ${ACCENT}` }}>
            {data.verdictPullQuote}
          </blockquote>
        </section>

        {/* ── Buy ── */}
        <section id="buy" className="flex flex-col gap-5">
          <SectionH2>Where to buy</SectionH2>
          <div className="border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="font-serif text-xl leading-snug">{data.buy.productTitle}</div>
                <div className="text-[13px] text-muted-foreground">{data.buy.retailerNote}</div>
              </div>
              {cta && <div className="shrink-0">{cta}</div>}
            </div>
            <div className="border-t border-border">
              {data.buy.rows.map((b) => (
                <div key={b.k} className="grid gap-2 border-b border-border py-3 text-sm leading-relaxed sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                  <span className="font-semibold">{b.k}</span>
                  <span>{b.v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{data.buy.disclaimer}</p>
          </div>
          {(data.buy.officialStore || data.buy.sihooTrialNote) && (
            <div className="border border-border p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="text-[15px] font-medium">
                  {data.buy.officialStore?.label ?? "Manufacturer store"}
                </div>
                <div className="text-[13px] leading-relaxed text-muted-foreground">
                  {data.buy.officialStore?.note ?? data.buy.sihooTrialNote}
                </div>
              </div>
              {data.buy.officialStore?.url && (
                <a
                  href={data.buy.officialStore.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 border border-foreground px-5 py-3 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Visit official store <span className="opacity-55">→</span>
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="flex flex-col gap-5">
          <SectionH2>Frequently asked questions</SectionH2>
          <div className="border-t border-border">
            {data.faqs.map((f) => (
              <details key={f.q} className="border-b border-border">
                <summary className="flex cursor-pointer items-baseline justify-between gap-5 py-4 text-base font-medium leading-snug">
                  {f.q}
                  <span className="text-muted-foreground">+</span>
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Sources ── */}
        <section id="sources" className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-medium text-foreground">Sources</h2>
          <div className="flex flex-col gap-3">
            {data.sources.map((s) => (
              <div key={s.k} className="grid gap-2 text-[13.5px] leading-relaxed sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                <span className="font-semibold">{s.k}</span>
                <span>{s.v}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            {data.sourcesFooter ??
              "Specifications are recorded as published on the dates shown and are not independently verified by Furniblog. Where the manufacturer page and the Amazon listing disagree, this page follows the listing you buy from. Manufacturers sometimes revise hardware without renaming a model; always check the listing before buying."}
          </p>
        </section>
      </div>
    </div>
  )
}

function SpecColumn({ title, rows }: { title: string; rows: RichReview["adjustable"] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="flex flex-col border-t border-border">
        {rows.map((a) => (
          <div key={a.k} className="flex flex-col gap-1 border-b border-border py-3">
            <div className="text-[14.5px] font-medium">{a.k}</div>
            <div className="text-[13.5px] leading-relaxed">{a.v}</div>
            {a.src && <div className="text-[11.5px] text-muted-foreground">{a.src}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function BasisCard({ title, items }: { title: string; items: RichReview["pros"] }) {
  return (
    <div className="border border-border bg-card p-5 flex flex-col gap-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
      {items.map((p, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="text-[14.5px] leading-relaxed">{p.t}</div>
          <div className="text-xs text-muted-foreground">Basis: {p.src}</div>
        </div>
      ))}
    </div>
  )
}
