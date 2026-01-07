import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/contexts/auth-context'
import type { Profile } from '@/types/database'

interface AuthProviderWrapperProps {
  children: React.ReactNode
}

export interface InitialUserData {
  id: string
  email: string
  profile: Profile | null
}

export async function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  const supabase = await createClient()
  // getUser() validates with Supabase server - ensures fresh auth state
  const { data: { user } } = await supabase.auth.getUser()

  // Pass initial auth state AND user data to client - prevents duplicate fetches
  let initialAuthState: 'authenticated' | 'unauthenticated' = 'unauthenticated'
  let initialUser: InitialUserData | null = null

  if (user) {
    initialAuthState = 'authenticated'
    // Fetch profile on server to pass to client - prevents client re-fetch
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    initialUser = {
      id: user.id,
      email: user.email!,
      profile,
    }
  }

  return (
    <AuthProvider initialAuthState={initialAuthState} initialUser={initialUser}>
      {children}
    </AuthProvider>
  )
}
