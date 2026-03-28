'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { getQuestDisplayTitle, isQuestRevealed } from '@/lib/quests'
import type { Quest, UserProgress } from '@/types'

interface Props {
  quests: Quest[]
  activeIdx: number
  progress: UserProgress
  xpInfo: { next: string; needed: number; pct: number }
  canAccess: (idx: number) => boolean
  onSelectQuest: (idx: number) => void
  saving: boolean
  teleportScrollCost: number
  nextSecretQuest: Quest | null
  onBuyTeleportScroll: () => Promise<boolean>
  onRevealNextSecretQuest: () => Promise<Quest | null>
}

export default function DungeonSidebar({
  quests,
  activeIdx,
  progress,
  xpInfo,
  canAccess,
  onSelectQuest,
  saving,
  teleportScrollCost,
  nextSecretQuest,
  onBuyTeleportScroll,
  onRevealNextSecretQuest,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const teleportScrolls = progress.teleportScrolls ?? 0

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Farewell, Adventurer.')
    router.push('/')
    router.refresh()
  }

  async function handleBuyTeleportScroll() {
    const ok = await onBuyTeleportScroll()
    if (ok) {
      toast.success('Teleport Scroll added to your pack.')
    } else {
      toast.error('Not enough XP to buy a Teleport Scroll.')
    }
  }

  async function handleRevealNextSecretQuest() {
    if (!nextSecretQuest) {
      toast.success('Every secret quest is already revealed.')
      return
    }

    if (teleportScrolls <= 0) {
      toast.error('Buy a Teleport Scroll first.')
      return
    }

    const revealedQuest = await onRevealNextSecretQuest()
    if (revealedQuest) {
      toast.success(`${revealedQuest.title} has been revealed.`)
    } else {
      toast.error('The scroll fizzled. Try again.')
    }
  }

  return (
    <aside className="flex h-screen w-72 min-w-[18rem] flex-col overflow-y-auto border-r border-rune/15 bg-deep">
      <div className="border-b border-rune/15 px-5 py-5">
        <div className="font-cinzel text-xl font-black tracking-wider text-rune text-shadow-rune">
          SQL:DUNGEON
        </div>
        <div className="mt-0.5 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-mist">
          CSCI 331 · PPG_2
        </div>
      </div>

      <div className="border-b border-rune/10 px-5 py-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-mist">Experience</span>
          <span className="font-cinzel text-sm text-gold">{progress.xp} XP</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-rune/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rune-dim to-rune transition-all duration-700"
            style={{ width: `${xpInfo.pct}%` }}
          />
        </div>
        <div className="mt-1.5 font-cinzel text-[0.6rem] tracking-wide text-gold-dim">
          Rank: {progress.rank}
        </div>
        {xpInfo.next !== 'MAX' && (
          <div className="mt-0.5 font-cinzel text-[0.55rem] text-mist">
            {xpInfo.needed} XP to {xpInfo.next}
          </div>
        )}
      </div>

      <div className="border-b border-rune/10 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-cinzel text-[0.55rem] tracking-[0.25em] uppercase text-fuchsia-300">Arcane Shop</span>
          <span className="font-cinzel text-[0.6rem] uppercase text-cyan-200">
            {teleportScrolls} Scroll{teleportScrolls === 1 ? '' : 's'}
          </span>
        </div>

        <div className="rounded border border-fuchsia-500/25 bg-fuchsia-500/5 p-3">
          <div className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-fuchsia-200">
            Teleport Scroll
          </div>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Spend one scroll to reveal the next hidden Epic or Mythic quest.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={handleBuyTeleportScroll}
              disabled={saving}
              className="w-full border border-fuchsia-500/30 bg-fuchsia-500/10 py-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Scroll (-{teleportScrollCost} XP)
            </button>
            <button
              onClick={handleRevealNextSecretQuest}
              disabled={saving || !nextSecretQuest || teleportScrolls <= 0}
              className="w-full border border-cyan-400/30 bg-cyan-400/10 py-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-cyan-100 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use Scroll on ???
            </button>
          </div>

          <div className="mt-3 font-cinzel text-[0.55rem] uppercase tracking-[0.12em] text-mist">
            {nextSecretQuest ? 'A hidden contract still waits.' : 'All hidden contracts revealed.'}
          </div>
        </div>
      </div>

      <div className="border-b border-rune/10 px-5 py-2">
        <span className="font-cinzel text-[0.55rem] tracking-[0.25em] uppercase text-rune-dim">Quest Log</span>
      </div>

      <nav className="flex-1">
        {quests.map((q, i) => {
          const qp = progress.quests[q.id]
          const completed = !!qp?.completed
          const revealed = isQuestRevealed(q, progress)
          const locked = !canAccess(i)
          const active = activeIdx === i
          const hiddenSecret = q.secret && !revealed

          return (
            <button
              key={q.id}
              onClick={() => {
                if (hiddenSecret) {
                  toast.error('Use a Teleport Scroll in the shop to reveal this quest.')
                  return
                }
                if (locked) {
                  toast.error('Complete the previous quest first.')
                  return
                }
                onSelectQuest(i)
              }}
              className={cn(
                'relative w-full border-b border-rune/8 px-5 py-4 text-left transition-colors',
                active && 'border-l-2 border-l-rune bg-rune/8',
                !active && !locked && 'hover:bg-rune/5',
                locked && 'opacity-35 cursor-not-allowed',
                completed && 'opacity-70',
              )}
            >
              {completed && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gold">✦</span>
              )}

              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-mist">
                {q.id} · {q.rank}
              </div>
              <div className="mt-0.5 font-cinzel text-[0.8rem] leading-snug text-parchment">
                {getQuestDisplayTitle(q, progress)}
              </div>
              {hiddenSecret && (
                <div className="mt-1 font-cinzel text-[0.5rem] tracking-[0.15em] uppercase text-fuchsia-300/80">
                  Hidden until a Teleport Scroll is used
                </div>
              )}
              <div className="mt-1.5 flex gap-0.5">
                {Array.from({ length: 5 }, (_, s) => (
                  <span key={s} className={`text-[0.55rem] ${s < q.diff ? 'text-gold' : 'text-gold/20'}`}>
                    ★
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-rune/10 p-4">
        <button
          onClick={() => window.location.href = '/guild'}
          className="w-full border border-rune/30 bg-rune/8 py-2 font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-rune transition-all hover:bg-rune/20"
        >
          Kazi & Azm Trials
        </button>
        <button
          onClick={() => window.location.href = '/leaderboard'}
          className="w-full border border-gold/20 bg-gold/5 py-2 font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-gold transition-all hover:bg-gold/15"
        >
          Guild Hall Leaderboard
        </button>
        <button
          onClick={handleSignOut}
          className="w-full border border-rune/15 py-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase text-mist transition-all hover:border-rune/30 hover:text-parchment"
        >
          Leave the Dungeon
        </button>
      </div>
    </aside>
  )
}
