/* TEAM 2 — Skeleton: Loading skeleton for product cards */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-4 w-12 skeleton rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="h-16 w-3/4 skeleton rounded" />
          <div className="h-6 w-1/2 skeleton rounded" />
          <div className="flex gap-4">
            <div className="h-12 w-32 skeleton rounded-pill" />
            <div className="h-12 w-32 skeleton rounded-pill" />
          </div>
        </div>
        <div className="h-96 skeleton rounded-card" />
      </div>
    </div>
  );
}
