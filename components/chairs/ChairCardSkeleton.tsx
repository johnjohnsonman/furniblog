export function ChairCardSkeleton() {
  return (
    <article className="flex flex-col border border-premium-border rounded-[2px] bg-white overflow-hidden">
      <div className="aspect-square animate-pulse bg-gray-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 border-t border-premium-border pt-4 flex justify-between">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </article>
  )
}
