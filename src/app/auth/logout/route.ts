import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Sign out with global scope to invalidate all sessions
  await supabase.auth.signOut({ scope: 'global' })

  // Get all Supabase-related cookies and clear them explicitly
  const allCookies = cookieStore.getAll()
  const response = NextResponse.json({ success: true })

  // Clear all Supabase auth cookies
  for (const cookie of allCookies) {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
      })
    }
  }

  // Set cache headers to prevent caching of auth state
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')

  return response
}
