interface SkeletonPostProps {
  lines?: number
}

/**
 * A single post skeleton — mimics the Item component's visual structure
 * with pulsing placeholder bars for timestamp, content, and tags.
 */
function SkeletonPost({ lines = 4 }: SkeletonPostProps) {
  return (
    <article
      className="rounded-[var(--radius-md)] bg-[var(--color-card)] px-4 py-3 sm:px-5 sm:py-4 mb-3"
      aria-busy="true"
      aria-label="Loading post"
    >
      {/* Timestamp placeholder */}
      <div className="mb-2 flex items-center leading-none">
        <span className="h-1 w-1 rounded-full bg-[var(--color-line)]" aria-hidden="true" />
        <div className="skeleton ml-2 h-3 w-20" />
      </div>

      {/* Content placeholders */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="skeleton h-4"
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Tag placeholders */}
      <div className="mt-3 flex gap-1.5">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-10 rounded-full" style={{ animationDelay: '100ms' }} />
      </div>
    </article>
  )
}

interface ContentSkeletonProps {
  count?: number
}

/**
 * Page-level skeleton — renders multiple post skeletons
 * to fill the visible viewport.
 */
export default function ContentSkeleton({ count = 4 }: ContentSkeletonProps) {
  return (
    <div className="flex flex-col gap-3" role="status">
      <span className="sr-only">Loading content...</span>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonPost key={i} lines={i === 0 ? 5 : 3 + (i % 3)} />
      ))}
    </div>
  )
}
