export type AffiliateChannel =
  | "official"
  | "amazon"
  | "rakuten"
  | "chairpark"

export interface AffiliateLink {
  channel: AffiliateChannel
  label: string
  url: string
}
