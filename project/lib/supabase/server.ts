import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Used in Server Components and API Route Handlers
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()          { return cookieStore.getAll() },
        setAll(toSet)     {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookie mutations ignored safely
          }
        },
      },
    }
  )
}

// Admin client — uses service role, bypasses RLS
// Only use in trusted server-side contexts (API routes)
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
