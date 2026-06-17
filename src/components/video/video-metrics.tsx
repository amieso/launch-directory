import { getMetrics, formatCount } from '@/lib/metrics'

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-7.2-4.6-9.6-8.4C.9 10.1 1.5 6.9 4.1 5.6c1.9-.9 4-.3 5.2 1.2l.7.9.7-.9c1.2-1.5 3.3-2.1 5.2-1.2 2.6 1.3 3.2 4.5 1.7 7C19.2 16.4 12 21 12 21z" />
    </svg>
  )
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 13h3v8H3v-8zm7-6h3v14h-3V7zm7 3h3v11h-3V10z" />
    </svg>
  )
}

/**
 * X engagement stats for a video, read from the build-time metrics cache.
 * Renders nothing when there are no metrics (no token, new video, etc.).
 *
 * - `pill`: roomy badge for the expanded modal (likes · replies · views)
 * - `inline`: compact likes-only for the grid card footer
 */
export function VideoMetrics({
  sourceUrl,
  variant = 'pill',
  className = '',
}: {
  sourceUrl?: string
  variant?: 'pill' | 'inline'
  className?: string
}) {
  const m = getMetrics(sourceUrl)
  if (!m || (m.likes === 0 && m.replies === 0 && m.impressions === 0)) return null

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-muted shrink-0 font-mono ${className}`}>
        <HeartIcon className="w-3 h-3" />
        {formatCount(m.likes)}
      </span>
    )
  }

  return (
    <div
      className={`w-fit inline-flex items-center gap-3 rounded px-2 py-1 bg-black/45 backdrop-blur-sm text-[11px] text-white/85 font-mono ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        <HeartIcon className="w-3 h-3" />
        {formatCount(m.likes)}
      </span>
      <span className="inline-flex items-center gap-1">
        <ReplyIcon className="w-3 h-3" />
        {formatCount(m.replies)}
      </span>
      <span className="inline-flex items-center gap-1">
        <ViewsIcon className="w-3 h-3" />
        {formatCount(m.impressions)}
      </span>
    </div>
  )
}
