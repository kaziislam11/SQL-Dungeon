'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Lock,
  LogOut,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react'
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

function getCollapsedQuestMeta({
  active,
  locked,
  completed,
  hiddenSecret,
}: {
  active: boolean
  locked: boolean
  completed: boolean
  hiddenSecret: boolean
}): { Icon: LucideIcon; iconClassName: string; shellClassName: string } {
  if (hiddenSecret) {
    return {
      Icon: Sparkles,
      iconClassName: 'text-fuchsia-200',
      shellClassName: 'border-fuchsia-500/30 bg-fuchsia-500/10',
    }
  }

  if (locked) {
    return {
      Icon: Lock,
      iconClassName: 'text-mist',
      shellClassName: 'border-rune/10 bg-transparent',
    }
  }

  if (active) {
    return {
      Icon: Swords,
      iconClassName: 'text-rune',
      shellClassName: 'border-rune/60 bg-rune/20 shadow-[0_0_18px_rgba(139,92,246,0.18)]',
    }
  }

  if (completed) {
    return {
      Icon: Star,
      iconClassName: 'fill-current text-gold',
      shellClassName: 'border-gold/35 bg-gold/10',
    }
  }

  return {
    Icon: ScrollText,
    iconClassName: 'text-parchment',
    shellClassName: 'border-rune/25 bg-rune/5',
  }
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
  const teleportScrolls = progress.teleportScrolls ?? 0

  async function handleSignOut() {
    const supabase = createClient()
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
    <aside className="group/sidebar flex h-screen w-[4.5rem] min-w-[4.5rem] flex-col overflow-y-auto overflow-x-hidden border-r border-rune/15 bg-deep/95 transition-[width,min-width,background-color] duration-300 ease-out hover:w-[21rem] hover:min-w-[21rem] hover:bg-[#140f22]">
      <div className="border-b border-rune/15 px-2 py-4 transition-all duration-300 group-hover/sidebar:px-5">
        <div className="flex items-center justify-center group-hover/sidebar:justify-start">
          <div
            title="SQL:DUNGEON"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rune/30 bg-rune/10 text-rune"
          >
            <Shield className="h-5 w-5" />
          </div>
          <div className="ml-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/sidebar:ml-3 group-hover/sidebar:max-w-[14rem] group-hover/sidebar:opacity-100">
            <div className="whitespace-nowrap font-cinzel text-2xl font-black tracking-[0.14em] text-rune text-shadow-rune">
              SQL:DUNGEON
            </div>
            <div className="mt-1 whitespace-nowrap font-cinzel text-[0.68rem] tracking-[0.18em] uppercase text-mist">
              CSCI 331 - PPG_2
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-rune/10 px-2 py-4 transition-all duration-300 group-hover/sidebar:px-5">
        <div className="flex items-center justify-center group-hover/sidebar:hidden">
          <div
            title={`Experience: ${progress.xp} XP`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/8 text-gold"
          >
            <Zap className="h-5 w-5" />
          </div>
        </div>

        <div className="hidden group-hover/sidebar:block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-cinzel text-[0.62rem] tracking-[0.18em] uppercase text-mist">Experience</span>
            <span className="font-cinzel text-base text-gold">{progress.xp} XP</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-rune/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rune-dim to-rune transition-all duration-700"
              style={{ width: `${xpInfo.pct}%` }}
            />
          </div>
          <div className="mt-1.5 font-cinzel text-[0.68rem] tracking-wide text-gold-dim">
            Rank: {progress.rank}
          </div>
          {xpInfo.next !== 'MAX' && (
            <div className="mt-0.5 font-cinzel text-[0.62rem] text-mist">
              {xpInfo.needed} XP to {xpInfo.next}
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-rune/10 px-2 py-4 transition-all duration-300 group-hover/sidebar:px-5">
        <div className="flex items-center justify-center group-hover/sidebar:hidden">
          <div
            title={`Arcane Shop: ${teleportScrolls} teleport scroll${teleportScrolls === 1 ? '' : 's'}`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/8 text-fuchsia-200"
          >
            <Wand2 className="h-5 w-5" />
          </div>
        </div>

        <div className="hidden group-hover/sidebar:block">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-cinzel text-[0.62rem] tracking-[0.28em] uppercase text-fuchsia-300">Arcane Shop</span>
            <span className="font-cinzel text-[0.68rem] uppercase text-cyan-200">
              {teleportScrolls} Scroll{teleportScrolls === 1 ? '' : 's'}
            </span>
          </div>

          <div className="rounded border border-fuchsia-500/25 bg-fuchsia-500/5 p-3 transition-all duration-200 group-hover/sidebar:border-fuchsia-400/35 group-hover/sidebar:bg-fuchsia-500/10">
            <div className="font-cinzel text-[0.74rem] tracking-[0.15em] uppercase text-fuchsia-200">
              Teleport Scroll
            </div>
            <p className="mt-2 text-[0.96rem] leading-relaxed text-mist">
              Spend one scroll to reveal the next hidden Epic or Mythic quest.
            </p>

            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={handleBuyTeleportScroll}
                disabled={saving}
                className="w-full border border-fuchsia-500/30 bg-fuchsia-500/10 py-2.5 font-cinzel text-[0.7rem] tracking-[0.18em] uppercase text-fuchsia-200 transition-all duration-200 hover:border-fuchsia-300/50 hover:bg-fuchsia-500/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Scroll (-{teleportScrollCost} XP)
              </button>
              <button
                onClick={handleRevealNextSecretQuest}
                disabled={saving || !nextSecretQuest || teleportScrolls <= 0}
                className="w-full border border-cyan-400/30 bg-cyan-400/10 py-2.5 font-cinzel text-[0.7rem] tracking-[0.18em] uppercase text-cyan-100 transition-all duration-200 hover:border-cyan-200/45 hover:bg-cyan-400/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use Scroll on ???
              </button>
            </div>

            <div className="mt-3 font-cinzel text-[0.62rem] uppercase tracking-[0.12em] text-mist">
              {nextSecretQuest ? 'A hidden contract still waits.' : 'All hidden contracts revealed.'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-rune/10 px-2 py-2 text-center transition-all duration-300 group-hover/sidebar:px-5 group-hover/sidebar:text-left">
        <span className="text-rune-dim group-hover/sidebar:hidden">
          <ScrollText className="mx-auto h-4 w-4" />
        </span>
        <span className="hidden font-cinzel text-[0.62rem] tracking-[0.28em] uppercase text-rune-dim group-hover/sidebar:inline">
          Quest Log
        </span>
      </div>

      <nav className="flex-1">
        {quests.map((q, i) => {
          const qp = progress.quests[q.id]
          const completed = !!qp?.completed
          const revealed = isQuestRevealed(q, progress)
          const locked = !canAccess(i)
          const active = activeIdx === i
          const hiddenSecret = !!q.secret && !revealed
          const displayTitle = getQuestDisplayTitle(q, progress)
          const { Icon, iconClassName, shellClassName } = getCollapsedQuestMeta({
            active,
            locked,
            completed,
            hiddenSecret,
          })

          return (
            <button
              key={q.id}
              title={`${q.id}: ${displayTitle}`}
              aria-label={`${q.id}: ${displayTitle}`}
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
                'group/item relative w-full border-b border-rune/8 px-2 py-3 text-center transition-all duration-200 group-hover/sidebar:px-5 group-hover/sidebar:py-4 group-hover/sidebar:text-left',
                active && 'bg-rune/10 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.18)]',
                !active && !locked && 'hover:bg-gradient-to-r hover:from-rune/14 hover:to-transparent hover:shadow-[inset_0_0_0_1px_rgba(240,180,41,0.12)]',
                !active && !locked && 'group-hover/sidebar:hover:border-l-2 group-hover/sidebar:hover:border-l-gold/60 group-hover/sidebar:hover:pl-6',
                locked && 'cursor-not-allowed opacity-35',
                completed && 'opacity-70',
              )}
            >
              <div className="flex items-center justify-center group-hover/sidebar:hidden">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl border transition-all',
                    shellClassName,
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5', iconClassName)} />
                </div>
              </div>

              <div className="hidden group-hover/sidebar:block">
                {completed && (
                  <Star className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-gold" />
                )}

                <div className="font-cinzel text-[0.62rem] tracking-[0.18em] uppercase text-mist transition-colors duration-200 group-hover/item:text-gold-dim">
                  {q.id} - {q.rank}
                </div>
                <div className="mt-0.5 font-cinzel text-[0.94rem] leading-snug text-parchment transition-colors duration-200 group-hover/item:text-white">
                  {displayTitle}
                </div>
                {hiddenSecret && (
                  <div className="mt-1 font-cinzel text-[0.56rem] tracking-[0.15em] uppercase text-fuchsia-300/80">
                    Hidden until a Teleport Scroll is used
                  </div>
                )}
                <div className="mt-1.5 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-3 w-3',
                        s < q.diff ? 'fill-current text-gold' : 'text-gold/20',
                      )}
                    />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-rune/10 p-2 transition-all duration-300 group-hover/sidebar:p-4">
        <button
          title="Kazi and Azm Trials"
          aria-label="Kazi and Azm Trials"
          onClick={() => window.location.href = '/guild'}
          className="w-full border border-rune/30 bg-rune/8 py-2.5 text-center font-cinzel text-[0.7rem] tracking-[0.18em] uppercase text-rune transition-all duration-200 hover:border-rune/60 hover:bg-rune/20 hover:text-white"
        >
          <span className="group-hover/sidebar:hidden">
            <Swords className="mx-auto h-4 w-4" />
          </span>
          <span className="hidden group-hover/sidebar:inline">Kazi & Azm Trials</span>
        </button>
        <button
          title="Guild Hall Leaderboard"
          aria-label="Guild Hall Leaderboard"
          onClick={() => window.location.href = '/leaderboard'}
          className="w-full border border-gold/20 bg-gold/5 py-2.5 text-center font-cinzel text-[0.7rem] tracking-[0.18em] uppercase text-gold transition-all duration-200 hover:border-gold/45 hover:bg-gold/15 hover:text-yellow-100"
        >
          <span className="group-hover/sidebar:hidden">
            <Trophy className="mx-auto h-4 w-4" />
          </span>
          <span className="hidden group-hover/sidebar:inline">Guild Hall Leaderboard</span>
        </button>
        <button
          title="Leave the Dungeon"
          aria-label="Leave the Dungeon"
          onClick={handleSignOut}
          className="w-full border border-rune/15 py-2.5 text-center font-cinzel text-[0.7rem] tracking-[0.18em] uppercase text-mist transition-all duration-200 hover:border-rune/35 hover:bg-rune/10 hover:text-parchment"
        >
          <span className="group-hover/sidebar:hidden">
            <LogOut className="mx-auto h-4 w-4" />
          </span>
          <span className="hidden group-hover/sidebar:inline">Leave the Dungeon</span>
        </button>
      </div>
    </aside>
  )
}
