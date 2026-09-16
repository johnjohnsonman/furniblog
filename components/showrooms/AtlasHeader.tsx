import Link from "next/link";

const links = [
  ["Find Stores", "/stores"],
  ["Chairs", "/products"],
  ["chA.I.r", "/chair"],
  ["Guides", "/chairpedia"],
  ["Blog", "/blog"],
  ["Brands", "/brands"],
  ["Reviews", "/reviews"],
  ["News", "/news"],
  ["Videos", "/videos"],
] as const;

export function AtlasHeader() {
  return (
    <header className="atlas-header">
      <Link href="/" className="atlas-wordmark">Chairpedia</Link>
      <nav className="atlas-main-nav" aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} aria-current={href === "/stores" ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
