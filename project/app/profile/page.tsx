import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getXpToNextRank } from '@/lib/utils/xp'
import { QUESTS, getQuestDisplayTitle } from '@/lib/quests'
import { XPBar } from '@/components/ui/XPBar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import type { UserProgress } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, xp, progress, created_at')
    .eq('id', user.id)
    .single()

  const progress: UserProgress = profile?.progress ?? {
    xp: 0,
    quests: {},
    rank: 'Apprentice Scribe',
    teleportScrolls: 0,
    revealedSecretQuestIds: [],
  }
  const xpInfo   = getXpToNextRank(profile?.xp ?? 0)
  const questsDone = Object.values(progress.quests).filter(q => q.completed).length

  return (
    <div className="min-h-screen bg-abyss">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05)_0%,transparent_65%)]" />

      <div className="mx-auto max-w-2xl px-6 py-16 relative z-10">
        {/* Back */}
        <Link href="/dungeon"
          className="mb-8 inline-flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist hover:text-parchment transition-colors">
          ← Back to Dungeon
        </Link>

        {/* Header */}
        <div className="mb-10 border border-rune/15 bg-deep p-8">
          <p className="mb-1 font-cinzel text-[0.6rem] tracking-[0.3em] uppercase text-rune-dim">❖ Adventurer Dossier</p>
          <h1 className="font-cinzel text-3xl font-black text-parchment text-shadow-rune">
            {profile?.username ?? 'Unknown'}
          </h1>
          <p className="mt-1 font-cinzel text-xs tracking-wide text-mist">
            {user.email}
          </p>

          <div className="mt-6">
            <XPBar
              xp={profile?.xp ?? 0}
              rank={progress.rank}
              xpInfo={xpInfo}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-rune/10 pt-6 sm:grid-cols-4">
            {[
              ['Quests Done', questsDone],
              ['Total XP',    profile?.xp ?? 0],
              ['Hints Used',  Object.values(progress.quests).reduce((acc, q) => acc + q.hintsUsed.length, 0)],
              ['TP Scrolls',  progress.teleportScrolls ?? 0],
            ].map(([label, val]) => (
              <div key={String(label)} className="text-center">
                <div className="font-cinzel text-2xl font-bold text-gold">{val}</div>
                <div className="mt-0.5 font-cinzel text-[0.55rem] tracking-widest text-mist uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quest progress */}
        <div className="mb-3 font-cinzel text-[0.6rem] tracking-[0.25em] uppercase text-rune-dim">❖ Quest Progress</div>
        <div className="space-y-3">
          {QUESTS.map(quest => {
            const qp        = progress.quests[quest.id]
            const cleared   = qp?.floorsCleared?.length ?? 0
            const completed = qp?.completed ?? false

            return (
              <div key={quest.id} className="border border-rune/15 bg-deep p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-mist">{quest.id}</p>
                    <h3 className="font-cinzel text-sm font-bold text-parchment leading-snug">
                      {getQuestDisplayTitle(quest, progress)}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge rank={quest.rank} />
                    <StarRating value={quest.diff} />
                  </div>
                </div>

                {/* Floor pips */}
                <div className="flex items-center gap-2">
                  {quest.floors.map((f, i) => {
                    const floorDone = completed || (qp?.floorsCleared ?? []).includes(i)
                    return (
                      <div key={i} className="flex-1">
                        <div className={`h-1 rounded-full transition-colors ${floorDone ? 'bg-rune' : 'bg-rune/10'}`} />
                        <div className={`mt-1 font-cinzel text-[0.5rem] tracking-widest text-center ${floorDone ? 'text-rune-dim' : 'text-mist/30'}`}>
                          {['I','II','III','IV'][i]}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {completed && (
                  <p className="mt-3 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-gold animate-glow-gold">
                    ✦ Completed · +{quest.xp} XP
                  </p>
                )}
                {!completed && cleared > 0 && (
                  <p className="mt-3 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-mist">
                    {cleared}/4 floors cleared
                  </p>
                )}
                {!completed && cleared === 0 && (
                  <p className="mt-3 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-mist/30">
                    Not started
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="font-cinzel text-[0.55rem] tracking-wide text-mist uppercase">
            Member since {new Date(profile?.created_at ?? '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
