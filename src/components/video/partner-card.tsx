import Link from 'next/link'
import { PARTNER_OPTIONS } from '@/data/partner'
import { ArrowIcon } from '@/components/ui/player-icons'

export function PartnerCard() {
  return (
    <article className="group">
      {/* Matches the reserved video-card slot so it aligns with sibling cards */}
      <div className="relative aspect-video w-full">
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-md bg-surface border border-border p-3 sm:p-4 transition-colors group-hover:border-foreground/15">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted">
            Ways to partner
          </span>

          <div className="mt-2 grid flex-1 grid-cols-2 grid-rows-2 gap-1.5">
            {PARTNER_OPTIONS.map((option) => (
              <Link
                key={option.id}
                href={`/partner#${option.id}`}
                className="group/row flex items-center justify-between gap-2 rounded-[5px] bg-foreground/[0.02] px-2.5 transition-colors hover:bg-foreground/[0.06]"
              >
                <span className="text-sm text-foreground truncate">{option.name}</span>
                <ArrowIcon className="h-4 w-4 shrink-0 text-muted transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Info row mirrors the video card's caption line */}
      <div className="flex items-center justify-between gap-2 pt-[14px] pb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs text-muted shrink-0">Lowkey</span>
          <span className="text-xs text-foreground truncate">Partner with us</span>
        </div>
        <span className="text-xs text-muted shrink-0 font-mono">Partner</span>
      </div>
    </article>
  )
}
