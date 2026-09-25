"use client"

/** Switches ProductChairTabs to the Reviews tab (see its "product-select-tab" listener). */
export function OpenReviewsTabButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("product-select-tab", { detail: "reviews" }))}
    >
      {children}
    </button>
  )
}
