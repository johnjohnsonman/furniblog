/**
 * Microsoft Clarity (heatmaps + session recordings). The project ID is a public
 * client-side token, so it's safe to ship in the bundle; override via
 * NEXT_PUBLIC_CLARITY_ID if it ever changes. Loaded as a plain <script> (like
 * GoogleAnalytics) so it runs straight from the server HTML. Skipped in local
 * dev to keep Clarity data clean.
 */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID?.trim() || "x9uxdwjjpl"

export function MicrosoftClarity() {
  if (process.env.NODE_ENV !== "production") return null
  if (!CLARITY_ID) return null

  return (
    <script
      id="ms-clarity"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`,
      }}
    />
  )
}
