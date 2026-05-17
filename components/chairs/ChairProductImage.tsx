import { resolveProductImageUrl } from "@/lib/chair-placeholder-images"
import { cn } from "@/lib/utils"

interface ChairProductImageProps {
  src?: string | null
  alt: string
  category: string
  className?: string
}

export function ChairProductImage({
  src,
  alt,
  category,
  className,
}: ChairProductImageProps) {
  const resolved = resolveProductImageUrl(src, category)

  return (
    <img
      src={resolved}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
    />
  )
}
