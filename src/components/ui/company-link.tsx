'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { companySlug } from '@/lib/utils'

interface CompanyLinkProps {
  company: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
  children?: React.ReactNode
}

export function CompanyLink({ company, className, onClick, children }: CompanyLinkProps) {
  const { authState } = useAuth()
  const isLoggedIn = authState !== 'unauthenticated'

  if (isLoggedIn) {
    return (
      <Link
        href={`/company/${companySlug(company)}`}
        onClick={onClick}
        className={className}
      >
        {children || company}
      </Link>
    )
  }

  // When logged out: plain text, no hover effects, no link
  return (
    <span className={className?.replace(/hover:[^\s]+/g, '')}>
      {children || company}
    </span>
  )
}
