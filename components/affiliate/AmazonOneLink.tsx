import Script from "next/script"

/**
 * Amazon OneLink — geo-localizes every Amazon link on the site.
 *
 * When a visitor from the UK (etc.) clicks an `amazon.com` link, OneLink
 * redirects them to their local Amazon store (amazon.co.uk) with the correct
 * regional tracking, checking that the product exists there and falling back
 * gracefully if not. Works across the "Earn Globally" marketplaces linked to
 * the US store ID (US/CA/UK/DE/FR/IT/NL/PL/ES/SE).
 *
 * The adInstanceId is account-specific — get it from Associates Central →
 * Tools → OneLink → "Get the OneTag Script" and set NEXT_PUBLIC_AMAZON_ONELINK_ID.
 * Renders nothing until the id is configured.
 */
export function AmazonOneLink() {
  const id = process.env.NEXT_PUBLIC_AMAZON_ONELINK_ID?.trim()
  if (!id) return null

  return (
    <>
      <div id={`amzn-assoc-ad-${id}`} />
      <Script
        id="amazon-onelink"
        async
        src={`https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=${id}`}
        strategy="afterInteractive"
      />
    </>
  )
}
