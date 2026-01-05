'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const { isLoggedIn, toggleAuth } = useAuth()
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm">
      <div className="px-4 md:px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-kanit font-bold text-foreground">lowkey</span>
          </Link>

          {/* Right side nav */}
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/about"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Submit
            </Link>
            <button
              onClick={toggleAuth}
              className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
            >
              {isLoggedIn ? 'Log Out' : 'Log In'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
