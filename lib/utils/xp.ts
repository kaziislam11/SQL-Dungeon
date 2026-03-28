import type { UserProgress } from '@/types'

export const RANKS = [
  { min: 0,   label: 'Apprentice Scribe' },
  { min: 100, label: 'Junior Arcanist' },
  { min: 250, label: 'Query Mage' },
  { min: 450, label: 'Rune Scholar' },
  { min: 700, label: 'Dungeon Analyst' },
  { min: 1000,label: 'Grand Wizard of Data' },
] as const

export function getRank(xp: number): string {
  return [...RANKS].reverse().find(r => xp >= r.min)?.label ?? 'Apprentice Scribe'
}

export function getXpToNextRank(xp: number): { next: string; needed: number; pct: number } {
  const idx  = RANKS.findIndex(r => r.min > xp)
  if (idx === -1) return { next: 'MAX', needed: 0, pct: 100 }
  const prev = RANKS[idx - 1]?.min ?? 0
  const next = RANKS[idx]
  const pct  = Math.round(((xp - prev) / (next.min - prev)) * 100)
  return { next: next.label, needed: next.min - xp, pct }
}

export function buildInitialProgress(): UserProgress {
  return {
    xp: 0,
    quests: {},
    rank: 'Apprentice Scribe',
    teleportScrolls: 0,
    revealedSecretQuestIds: [],
  }
}
