export function ReviewsFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border border-[#EFEFEF] bg-white p-4 animate-pulse"
        >
          <div className="h-[60px] w-[60px] shrink-0 rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
