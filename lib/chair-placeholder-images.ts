export function getChairPlaceholderImage(_category: string): string {
  return "/images/chair-photo-unavailable.svg"
}
export function resolveProductImageUrl(imageUrl: string | null | undefined, category: string): string {
  const url = imageUrl?.trim()
  return url && !url.includes("images.unsplash.com") ? url : getChairPlaceholderImage(category)
}
