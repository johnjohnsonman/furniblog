import Link from "next/link"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import type { ResolvedImage } from "@/lib/data/product-images"
import { getPurchaseDecision, getPurchaseGuideLinks } from "@/lib/growth/purchase-decisions"

export function PurchaseDecisionCard({ productId, name, image, amazonUrl, placement, comparison, currentPath, horizontal = false }: {
  productId: string
  name: string
  image?: ResolvedImage | null
  amazonUrl: string
  placement: string
  comparison?: { slug: string; title: string } | null
  currentPath?: string
  horizontal?: boolean
}) {
  const decision = getPurchaseDecision(productId)
  const guides = getPurchaseGuideLinks(productId).filter(link => link.href !== currentPath)
  return (
    <div data-testid="purchase-decision" data-buying-product={productId} className={`grid min-w-0 gap-5 rounded-lg border border-border bg-[#f8f5ef] p-5 ${horizontal && image ? "sm:grid-cols-[160px_minmax(0,1fr)]" : ""}`}>
      {image && (
        <Link href={`/products/${productId}`} aria-label={`Explore ${name}`} className="block self-start rounded-md bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt} loading="lazy" className="h-36 w-full object-contain" />
          {image.caption && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{image.caption}</p>}
        </Link>
      )}
      <div className="min-w-0 space-y-3">
        <h3 className="font-serif text-xl leading-snug"><Link href={`/products/${productId}`} className="hover:underline">{name}</Link></h3>
        {decision && <>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before choosing this chair</p>
          <p className="text-sm font-medium leading-relaxed">{decision.focus}</p>
          <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
            {decision.checks.map(check => <li key={check}>{check}</li>)}
          </ul>
        </>}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href={`/products/${productId}`} className="underline underline-offset-4">See specifications</Link>
          {comparison && <Link href={`/compare/${comparison.slug}`} className="underline underline-offset-4">{comparison.title}</Link>}
        </div>
        {guides.length > 0 && <div className="space-y-2 text-sm" data-testid="purchase-guide-links">
          {guides.map(link => <Link key={link.href} href={link.href} className="block underline underline-offset-4">{link.label}</Link>)}
        </div>}
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check the current offer</p>
        <SmartBuyLink name={name} productId={productId} amazonUrl={amazonUrl} placement={placement} variant="block" showDisclaimer />
        <p className="text-xs leading-relaxed text-muted-foreground">Check the selected model, seller, delivery and return terms on the destination.</p>
      </div>
    </div>
  )
}
