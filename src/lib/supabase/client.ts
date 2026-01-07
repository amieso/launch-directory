import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Client-side: use singleton with cookie-based session storage
  // This ensures sessions sync with server-side auth (middleware, callbacks)
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Reset the singleton - used during sign out to ensure fresh state
export function resetClient() {
  client = null
}
