type Catalog = Record<string, Array<{ retailer: string; url: string }>>

// A catalog listing is a destination, not evidence of current stock or price.
export function amazonListingSlugs(catalog: Catalog): string[] {
  return Object.entries(catalog).filter(([, links]) => links.some(link => {
    try {
      const url = new URL(link.url)
      return url.protocol === 'https:' && ['amazon.com', 'www.amazon.com'].includes(url.hostname)
        && /^\/dp\/[A-Z0-9]{10}(?:\/|$)/i.test(url.pathname)
    } catch {
      return false
    }
  })).map(([slug]) => slug)
}
