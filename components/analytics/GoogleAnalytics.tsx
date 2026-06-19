import Script from "next/script"

/**
 * Google Analytics 4 (gtag.js). Env-gated by NEXT_PUBLIC_GA_ID — set it to your
 * GA4 Measurement ID (looks like "G-XXXXXXXXXX") in .env.local and Vercel.
 * Renders nothing until a real id is configured (ignores the placeholder).
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim()
  if (!id || !id.startsWith("G-") || id.includes("XXXX")) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}
