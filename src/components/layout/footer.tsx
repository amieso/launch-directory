import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-background mt-[52px]">
      <div className="mx-6 border-t border-white/[0.08]" />
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            © 2026 Lowkey
          </span>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Privacy & Cookies
            </Link>
            <Link
              href="https://twitter.com/lowkeyso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
