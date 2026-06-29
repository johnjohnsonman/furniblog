export interface Brand {
  id: string
  slug: string
  name: string
  country: string
  founded: number
  logo: string
  description: string
  descriptionLong?: string
  productCount: number
  category: string
  website?: string
  heroImageUrl?: string
  logoUrl?: string
  images?: string[]
  colorPrimary?: string
  colorSecondary?: string
}
