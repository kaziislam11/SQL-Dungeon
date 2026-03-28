'use client'

import { useState } from 'react'
import { useProgress } from '@/lib/hooks/useProgress'
import { QUESTS, TELEPORT_SCROLL_COST, getNextSecretQuestToReveal, isQuestRevealed } from '@/lib/quests'
import { getXpToNextRank } from '@/lib/utils/xp'
import DungeonSidebar from './DungeonSidebar'
import QuestView from './QuestView'

interface Props {
  userId: string
}

export default function DungeonClient({ userId }: Props) {
  const [activeQuestIdx, setActiveQuestIdx] = useState(0)
  const {
    progress,
    saving,
    clearFloor,
    completeQuest,
    useHint,
    buyTeleportScroll,
    revealSecretQuest,
  } = useProgress(userId)
  const xpInfo = getXpToNextRank(progress.xp)
  const activeQuest = QUESTS[activeQuestIdx]
  const questProgress = progress.quests[activeQuest.id]
  const nextSecretQuest = getNextSecretQuestToReveal(progress)

  function canAccessQuest(idx: number): boolean {
    const quest = QUESTS[idx]
    if (quest.secret) return isQuestRevealed(quest, progress)
    if (idx === 0) return true
    return !!progress.quests[QUESTS[idx - 1].id]?.completed
  }

  async function handleRevealNextSecretQuest() {
    if (!nextSecretQuest) return null
    const ok = await revealSecretQuest(nextSecretQuest.id)
    if (!ok) return null

    const nextSecretIdx = QUESTS.findIndex(quest => quest.id === nextSecretQuest.id)
    if (nextSecretIdx >= 0) setActiveQuestIdx(nextSecretIdx)

    return nextSecretQuest
  }

  return (
    <div className="flex min-h-screen bg-abyss">
      <DungeonSidebar
        quests={QUESTS}
        activeIdx={activeQuestIdx}
        progress={progress}
        xpInfo={xpInfo}
        canAccess={canAccessQuest}
        onSelectQuest={setActiveQuestIdx}
        saving={saving}
        teleportScrollCost={TELEPORT_SCROLL_COST}
        nextSecretQuest={nextSecretQuest}
        onBuyTeleportScroll={() => buyTeleportScroll(TELEPORT_SCROLL_COST)}
        onRevealNextSecretQuest={handleRevealNextSecretQuest}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <QuestView
          quest={activeQuest}
          questProgress={questProgress}
          onClearFloor={clearFloor}
          onCompleteQuest={completeQuest}
          onUseHint={useHint}
          saving={saving}
        />
      </div>
    </div>
  )
}
