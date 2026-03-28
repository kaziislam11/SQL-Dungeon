import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60  // ISR — rebuild at most every 60s, saves Supabase reads

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entries } = await supabase
    .from('leaderboard')
    .select('username, xp, quests_done, rank, updated_at')
    .order('xp', { ascending: false })
    .limit(20)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-abyss">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(240,180,41,0.04)_0%,transparent_65%)]" />

      <div className="mx-auto max-w-3xl px-6 py-16 relative z-10">
        {/* Back */}
        <Link href="/dungeon" className="mb-8 inline-flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist hover:text-parchment transition-colors">
          ← Back to Dungeon
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 font-cinzel text-xs tracking-[0.35em] text-gold-dim uppercase">❖ Guild Hall ❖</div>
          <h1 className="font-cinzel text-5xl font-black text-gold text-shadow-gold">Leaderboard</h1>
          <p className="mt-3 font-crimson text-base italic text-mist">
            The adventurers who bent the database to their will.
          </p>
        </div>

        {/* Table */}
        <div className="border border-gold/15 bg-deep">
          <div className="grid grid-cols-4 border-b border-gold/15 bg-gold/5 px-6 py-3">
            {['Rank','Adventurer','Quests','XP'].map(h=>(
              <span key={h} className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase text-gold">{h}</span>
            ))}
          </div>

          {entries?.length ? entries.map((e, i) => (
            <div key={e.username}
              className="grid grid-cols-4 items-center border-b border-gold/8 px-6 py-4 transition-colors hover:bg-gold/4">
              <span className="font-cinzel text-xl">
                {medals[i] ?? <span className="text-mist text-sm">{i+1}</span>}
              </span>
              <div>
                <div className="font-cinzel text-sm text-parchment">{e.username}</div>
                <div className="font-cinzel text-[0.55rem] tracking-wide text-mist">{e.rank}</div>
              </div>
              <span className="font-cinzel text-sm text-mist">{e.quests_done} quest{e.quests_done !== 1 ? 's' : ''}</span>
              <span className="font-cinzel text-lg font-bold text-gold text-shadow-gold">{e.xp} XP</span>
            </div>
          )) : (
            <div className="px-6 py-16 text-center font-crimson text-base italic text-mist">
              No adventurers have completed quests yet. Be the first.
            </div>
          )}
        </div>

        <p className="mt-4 text-center font-cinzel text-[0.55rem] tracking-wide text-mist uppercase">
          Updates every 60 seconds · Top 20 adventurers
        </p>
      </div>
    </div>
  )
}
