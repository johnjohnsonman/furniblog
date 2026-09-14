import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="font-serif text-xl font-medium text-foreground">
              Chairpedia
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Chairpedia (<span lang="ko">체어피디아</span>) helps you research chairs with product specifications, buying guides, and source-linked reviews.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Products
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=office" className="text-foreground hover:text-muted-foreground transition-colors">
                  Office Chairs
                </Link>
              </li>
              <li>
                <Link href="/products?category=gaming" className="text-foreground hover:text-muted-foreground transition-colors">
                  Gaming Chairs
                </Link>
              </li>
              <li>
                <Link href="/products?category=executive" className="text-foreground hover:text-muted-foreground transition-colors">
                  Executive Chairs
                </Link>
              </li>
              <li>
                <Link href="/products?category=standing" className="text-foreground hover:text-muted-foreground transition-colors">
                  Standing Chairs
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-foreground hover:text-muted-foreground transition-colors">
                  All Chairs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Best Lists
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/best/best-office-chairs" className="text-foreground hover:text-muted-foreground transition-colors">
                  Best Office Chairs
                </Link>
              </li>
              <li>
                <Link href="/best/best-for-back-pain" className="text-foreground hover:text-muted-foreground transition-colors">
                  Best for Back Pain
                </Link>
              </li>
              <li>
                <Link href="/best/best-for-tall-people" className="text-foreground hover:text-muted-foreground transition-colors">
                  Best for Tall People
                </Link>
              </li>
              <li>
                <Link href="/best/best-under-1000" className="text-foreground hover:text-muted-foreground transition-colors">
                  Best Under $1,000
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/compare" className="text-foreground hover:text-muted-foreground transition-colors">Compare Chairs</Link></li>
              <li><Link href="/chairpedia" className="text-foreground hover:text-muted-foreground transition-colors">Chair Guides</Link></li>
              <li><Link href="/reviews" className="text-foreground hover:text-muted-foreground transition-colors">Customer &amp; Web Reviews</Link></li>
              <li><Link href="/about" className="text-foreground hover:text-muted-foreground transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-foreground hover:text-muted-foreground transition-colors">Contact</Link></li>
              <li><Link href="/editorial-policy" className="text-foreground hover:text-muted-foreground transition-colors">Editorial Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-foreground hover:text-muted-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground hover:text-muted-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Chairpedia. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            Chairpedia participates in the Amazon Associates and Coupang Partners
            affiliate programs. We may earn a commission on qualifying purchases at
            no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  )
}
