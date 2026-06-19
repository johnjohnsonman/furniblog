/**
 * Google Analytics 4 (gtag.js). Env-gated by NEXT_PUBLIC_GA_ID — set it to your
 * GA4 Measurement ID ("G-XXXXXXXXXX") in .env.local and Vercel.
 *
 * Rendered as plain <script> tags (not next/script) so the gtag config runs
 * directly from the server HTML on page load — no dependency on client
 * hydration, which is the reliable way to fire GA in the App Router.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim()
  if (!id || !id.startsWith("G-") || id.includes("XXXX")) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <script
        id="ga4-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`,
        }}
      />
    </>
  )
}
