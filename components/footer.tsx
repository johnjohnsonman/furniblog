import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="font-serif text-xl font-medium text-foreground">
              Furniblog
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The global database for premium furniture, office chairs, and iconic designs.
            </p>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-foreground hover:text-muted-foreground transition-colors">All Products</Link></li>
              <li><Link href="/products?category=office" className="text-foreground hover:text-muted-foreground transition-colors">Office Chairs</Link></li>
              <li><Link href="/products?category=lounge" className="text-foreground hover:text-muted-foreground transition-colors">Lounge Chairs</Link></li>
              <li><Link href="/compare" className="text-foreground hover:text-muted-foreground transition-colors">Compare</Link></li>
            </ul>
          </div>

          {/* Best Lists */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Best Lists</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/best/best-office-chairs" className="text-foreground hover:text-muted-foreground transition-colors">Best Office Chairs</Link></li>
              <li><Link href="/best/best-ergonomic-chairs" className="text-foreground hover:text-muted-foreground transition-colors">Best Ergonomic Chairs</Link></li>
              <li><Link href="/best/best-for-back-pain" className="text-foreground hover:text-muted-foreground transition-colors">Best for Back Pain</Link></li>
              <li><Link href="/best/best-for-long-hours" className="text-foreground hover:text-muted-foreground transition-colors">Best for Long Hours</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-foreground hover:text-muted-foreground transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-foreground hover:text-muted-foreground transition-colors">Contact</Link></li>
              <li><Link href="/editorial-policy" className="text-foreground hover:text-muted-foreground transition-colors">Editorial Policy</Link></li>
              <li><Link href="/affiliate-disclosure" className="text-foreground hover:text-muted-foreground transition-colors">Affiliate Disclosure</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-foreground hover:text-muted-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground hover:text-muted-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Furniblog. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            Furniblog may earn a commission when you purchase through links on this site, at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  )
}
