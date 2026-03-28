'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRank } from '@/lib/utils/xp'
import type { UserProgress, QuestProgress } from '@/types'

// ─────────────────────────────────────────────────────────────
// Single JSONB read/write — never hits Supabase more than once
// per session for reads. Writes only on floor clear / quest complete.
// ─────────────────────────────────────────────────────────────

const INITIAL: UserProgress = {
  xp: 0,
  quests: {},
  rank: 'Apprentice Scribe',
  teleportScrolls: 0,
  revealedSecretQuestIds: [],
}

function normalizeProgress(progress?: Partial<UserProgress> | null, fallbackXp = 0): UserProgress {
  const xp = progress?.xp ?? fallbackXp

  return {
    xp,
    quests: progress?.quests ?? {},
    rank: progress?.rank ?? getRank(xp),
    teleportScrolls: progress?.teleportScrolls ?? 0,
    revealedSecretQuestIds: progress?.revealedSecretQuestIds ?? [],
  }
}

export function useProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<UserProgress>(INITIAL)
  const [saving,   setSaving]   = useState(false)
  const supabase = createClient()

  // Load once on mount
  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('progress, xp')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.progress || typeof data?.xp === 'number') {
          setProgress(normalizeProgress(data?.progress as UserProgress | null, data?.xp ?? 0))
        }
      })
  }, [userId])

  // Upsert the whole JSONB blob — one write per action
  const save = useCallback(async (next: UserProgress) => {
    if (!userId) return
    const normalized = normalizeProgress(next)
    setSaving(true)
    setProgress(normalized)
    await supabase
      .from('profiles')
      .update({ progress: normalized, xp: normalized.xp, updated_at: new Date().toISOString() })
      .eq('id', userId)
    setSaving(false)
  }, [userId])

  // Mark a floor as cleared
  const clearFloor = useCallback(async (questId: string, floorIdx: number) => {
    const qp: QuestProgress = progress.quests[questId] ?? {
      questId, floorsCleared: [], completed: false, hintsUsed: [],
    }
    if (qp.floorsCleared.includes(floorIdx)) return  // already cleared, skip write
    const updated: QuestProgress = {
      ...qp,
      floorsCleared: [...qp.floorsCleared, floorIdx],
    }
    await save({ ...progress, quests: { ...progress.quests, [questId]: updated } })
  }, [progress, save])

  // Mark quest complete + award XP
  const completeQuest = useCallback(async (questId: string, xpReward: number) => {
    const qp: QuestProgress = progress.quests[questId] ?? {
      questId, floorsCleared: [0,1,2,3], completed: false, hintsUsed: [],
    }
    if (qp.completed) return  // idempotent — don't double-award XP
    const newXp  = progress.xp + xpReward
    const updated: QuestProgress = {
      ...qp,
      floorsCleared: [0, 1, 2, 3],
      completed:     true,
      completedAt:   new Date().toISOString(),
    }
    await save({
      ...progress,
      xp:     newXp,
      rank:   getRank(newXp),
      quests: { ...progress.quests, [questId]: updated },
    })
  }, [progress, save])

  // Spend XP on a hint
  const useHint = useCallback(async (questId: string, hintId: number) => {
    const qp: QuestProgress = progress.quests[questId] ?? {
      questId, floorsCleared: [], completed: false, hintsUsed: [],
    }
    if (qp.hintsUsed.includes(hintId)) return true  // already unlocked
    const updated: QuestProgress = { ...qp, hintsUsed: [...qp.hintsUsed, hintId] }
    await save({
      ...progress,
      quests: { ...progress.quests, [questId]: updated },
    })
    return true
  }, [progress, save])

  const buyTeleportScroll = useCallback(async (cost: number) => {
    if (progress.xp < cost) return false
    const newXp = progress.xp - cost
    await save({
      ...progress,
      xp: newXp,
      rank: getRank(newXp),
      teleportScrolls: (progress.teleportScrolls ?? 0) + 1,
    })
    return true
  }, [progress, save])

  const revealSecretQuest = useCallback(async (questId: string) => {
    const revealedSecretQuestIds = progress.revealedSecretQuestIds ?? []
    if (revealedSecretQuestIds.includes(questId)) return true
    if ((progress.teleportScrolls ?? 0) <= 0) return false

    await save({
      ...progress,
      teleportScrolls: Math.max((progress.teleportScrolls ?? 0) - 1, 0),
      revealedSecretQuestIds: [...revealedSecretQuestIds, questId],
    })
    return true
  }, [progress, save])

  return {
    progress,
    saving,
    clearFloor,
    completeQuest,
    useHint,
    buyTeleportScroll,
    revealSecretQuest,
  }
}
