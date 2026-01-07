import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Handle magic link (OTP) verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'magiclink' | 'email',
    })

    if (!error) {
      const redirectUrl = new URL(next, origin)
      redirectUrl.searchParams.set('auth', 'success')
      return NextResponse.redirect(redirectUrl.toString())
    }

    console.log('[Auth Callback] OTP Error:', error.message)
    return NextResponse.redirect(`${origin}?error=auth`)
  }

  // Handle OAuth PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectUrl = new URL(next, origin)
      redirectUrl.searchParams.set('auth', 'success')
      return NextResponse.redirect(redirectUrl.toString())
    }

    console.log('[Auth Callback] Code Error:', error.message)
  }

  // Return to home with error
  return NextResponse.redirect(`${origin}?error=auth`)
}
