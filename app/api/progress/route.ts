import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRank } from '@/lib/utils/xp'
import type { UserProgress } from '@/types'

// GET /api/progress — fetch current user's progress blob
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('progress, xp')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/progress — upsert the entire progress blob (single write)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { progress: UserProgress } = await req.json()
  if (!body.progress) return NextResponse.json({ error: 'Missing progress' }, { status: 400 })

  // Sync xp and rank at top level for leaderboard view queries
  const { error } = await supabase
    .from('profiles')
    .update({
      progress:   body.progress,
      xp:         body.progress.xp,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
