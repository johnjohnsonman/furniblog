export type AffiliateChannel =
  | "official"
  | "amazon"
  | "coupang"
  | "naver"
  | "rakuten"
  | "chairpark"

export interface AffiliateLink {
  channel: AffiliateChannel
  label: string
  url: string
}
