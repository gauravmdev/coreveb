/** Generic page skeleton shown while an admin/portal route's data loads.
 *  Renders inside the app shell's <main>, so it only needs page content. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-surface" />
        <div className="h-4 w-72 rounded bg-surface/70" />
      </div>

      {/* Metric row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border bg-surface/40" />
        ))}
      </div>

      {/* Table / list block */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 flex-1 rounded bg-surface" />
            <div className="h-4 w-24 rounded bg-surface/70" />
            <div className="h-4 w-16 rounded bg-surface/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
