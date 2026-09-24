export type ConversionEvent = {
  eventName: string
  productSlug?: string
  entityType?: string
  entityId?: string
  placement?: string
  metadata?: Record<string, string | number | boolean | null>
}

export function trackConversionEvent(event: ConversionEvent) {
  if (typeof window === "undefined" || navigator.webdriver || window.__chairpediaAnalyticsEnabled === false) return
  const payload = { ...event, pagePath: window.location.pathname }
  try {
    window.gtag?.("event", event.eventName, {
      page_path: payload.pagePath,
      ...(event.productSlug ? { product_slug: event.productSlug } : {}),
      ...(event.placement ? { placement: event.placement } : {}),
    })
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch { /* Analytics must never interrupt the user. */ }
}
