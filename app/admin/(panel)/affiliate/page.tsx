"use client"

import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links"
import { BulkAmazonLinksButton } from "@/components/admin/BulkAmazonLinksButton"

export default function AdminAffiliateLinksPage() {
  const slugs = Object.keys(AFFILIATE_LINKS_DATA).sort()

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-serif text-2xl font-medium mb-2">Affiliate Links</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Bulk-fill Supabase <code className="text-xs">affiliate_links</code> with Amazon URLs.
        Uses the static catalog when available; otherwise an Amazon search link with your
        associate tag.
      </p>

      <div className="flex flex-wrap gap-3 mb-10">
        <BulkAmazonLinksButton mode="missing" />
        <BulkAmazonLinksButton mode="all" variant="default" label="Replace all with Amazon" />
      </div>

      <h2 className="text-lg font-medium mb-4">Static catalog ({slugs.length} slugs)</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Retailers</th>
            </tr>
          </thead>
          <tbody>
            {slugs.map((slug) => {
              const links = AFFILIATE_LINKS_DATA[slug]
              return (
                <tr key={slug} className="border-b border-border">
                  <td className="py-3 px-4 font-mono text-xs">{slug}</td>
                  <td className="py-3 px-4">
                    {links.map((l) => l.retailer).join(" · ")}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
