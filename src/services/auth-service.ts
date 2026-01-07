import { createClient, resetClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export type AuthProvider = 'google' | 'github'

export interface SignUpData {
  email: string
  password: string
  name?: string
  avatarColor?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))
  ])
}

class AuthService {
  private pendingGetUser: Promise<AuthUser | null> | null = null

  private getSupabase() {
    return createClient()
  }

  async signUp({ email, password, name, avatarColor }: SignUpData) {
    const { data, error } = await this.getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          avatar_color: avatarColor,
        },
      },
    })

    if (error) throw error
    return data
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await this.getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signInWithOAuth(provider: AuthProvider) {
    const { data, error } = await this.getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error
    return data
  }

  async signInWithMagicLink(email: string) {
    const { data, error } = await this.getSupabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  async signOut() {
    // Use 'global' scope to invalidate all sessions on server, not just local
    const { error } = await this.getSupabase().auth.signOut({ scope: 'global' })
    // Reset the singleton client to ensure fresh state on next auth
    resetClient()
    if (error) throw error
  }

  async getUser(): Promise<AuthUser | null> {
    // Dedupe concurrent calls - if one is in flight, return same promise
    if (this.pendingGetUser) {
      return this.pendingGetUser
    }

    this.pendingGetUser = this._getUser()
    try {
      return await this.pendingGetUser
    } finally {
      this.pendingGetUser = null
    }
  }

  private async _getUser(): Promise<AuthUser | null> {
    try {
      const supabase = this.getSupabase()
      // Use getUser() to validate session with server - prevents stale localStorage data
      // This ensures we always have fresh auth state on page refresh
      // Add 5s timeout to prevent hanging on slow networks
      const userResult = await withTimeout(
        supabase.auth.getUser(),
        5000,
        null
      )

      if (!userResult?.data?.user) {
        return null
      }

      const user = userResult.data.user

      // Fetch profile with 3s timeout
      const profilePromise = new Promise<Profile | null>(async (resolve) => {
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          resolve(data)
        } catch {
          resolve(null)
        }
      })
      const profile = await withTimeout(profilePromise, 3000, null)

      return {
        id: user.id,
        email: user.email!,
        profile,
      }
    } catch (err) {
      console.error('[AuthService] getUser error:', err)
      return null
    }
  }

  async getSession() {
    const { data: { session }, error } = await this.getSupabase().auth.getSession()
    if (error) throw error
    return session
  }

  onAuthStateChange(callback: (user: AuthUser | null, event: string) => void) {
    const supabase = this.getSupabase()
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        callback({
          id: session.user.id,
          email: session.user.email!,
          profile,
        }, event)
      } else {
        callback(null, event)
      }
    })
  }

  async resetPassword(email: string) {
    const { error } = await this.getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  async updatePassword(password: string) {
    const { error } = await this.getSupabase().auth.updateUser({ password })
    if (error) throw error
  }
}

export const authService = new AuthService()
