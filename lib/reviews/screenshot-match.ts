type Product = { id: string; slug: string; name: string }

// Do not guess from brand overlap or an unnamed pronoun in a multi-chair thread.
export function matchScreenshotProduct(name: unknown, products: Product[]): Product | null {
  if (typeof name !== "string" || !name.trim()) return null
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  const key = normalize(name)
  if (!key) return null
  const matches = products.filter(product =>
    normalize(product.name) === key || normalize(product.slug) === key
  )
  return matches.length === 1 ? matches[0] : null
}
