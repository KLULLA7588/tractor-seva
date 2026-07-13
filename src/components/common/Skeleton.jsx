export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
          <div className="skeleton h-48 w-full" />
          <div className="p-5 space-y-3">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-white shadow-card">
      <div className="border-b border-border-light bg-brand-navy/5 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b border-border-light/50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border-subtle bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-12" />
            </div>
            <div className="skeleton h-12 w-12 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiagramSkeleton() {
  return (
    <div className="flex justify-center rounded-lg border border-border-subtle bg-white p-4 shadow-card">
      <div className="skeleton h-[400px] w-full max-w-2xl" />
    </div>
  );
}

export function RowListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border-subtle bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-1/5" />
            </div>
            <div className="skeleton h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-border-light bg-white p-12 text-center">
      {Icon && <Icon className="mx-auto h-12 w-12 text-text-gray/40" />}
      <p className="mt-3 text-base font-medium text-brand-navy">{title}</p>
      <p className="mt-1 text-sm text-text-gray">{message}</p>
    </div>
  );
}

export { EmptyState as default };
