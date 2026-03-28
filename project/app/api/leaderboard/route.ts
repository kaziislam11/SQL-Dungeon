import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/leaderboard — top 20 from the leaderboard view
// Uses Cache-Control to avoid hammering Supabase on every page load
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('leaderboard')
    .select('username, xp, quests_done, rank, updated_at')
    .order('xp', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    { data },
    {
      headers: {
        // Cache for 60s — stale-while-revalidate for 5min
        // Keeps Supabase reads low on a busy leaderboard
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  )
}
