'use client'

import { trackGoal, GOALS } from '@/lib/analytics'

interface PartnerCtaLinkProps {
  href: string
  /** Partner option id (e.g. 'reach', 'data') for attribution. */
  optionId: string
  /** Optional DOM id, used as a scroll anchor target (e.g. /partner#data). */
  id?: string
  className?: string
  children: React.ReactNode
}

// Client wrapper around a partner mailto CTA so we can record the click as a
// DataFast goal while keeping the /partner page itself a server component.
export function PartnerCtaLink({ href, optionId, id, className, children }: PartnerCtaLinkProps) {
  return (
    <a
      href={href}
      id={id}
      onClick={() => trackGoal(GOALS.partnerCtaClick, { option: optionId })}
      className={className}
    >
      {children}
    </a>
  )
}
