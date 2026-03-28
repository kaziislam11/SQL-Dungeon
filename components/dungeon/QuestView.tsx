'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'
import type { Hint, Quest, QuestProgress } from '@/types'

const SQLEditor = dynamic(() => import('./SQLEditor'), { ssr: false })

interface QueryEntry {
  floorTitle: string
  query: string
  result: string
}

interface Props {
  quest: Quest
  questProgress: QuestProgress | undefined
  onClearFloor: (questId: string, floorIdx: number) => Promise<void>
  onCompleteQuest: (questId: string, xp: number) => Promise<void>
  onUseHint: (questId: string, hintId: number) => Promise<boolean>
  saving: boolean
}

export default function QuestView({
  quest,
  questProgress,
  onClearFloor,
  onCompleteQuest,
  onUseHint,
  saving,
}: Props) {
  const [activeFloor, setActiveFloor] = useState(0)
  const [db, setDb] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ columns: string[]; values: any[][] } | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [clueVisible, setClueVisible] = useState(false)
  const [schemaOpen, setSchemaOpen] = useState(false)
  const [verdictInput, setVerdictInput] = useState('')
  const [verdictResult, setVerdictResult] = useState<'correct' | 'wrong' | null>(null)
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set())
  const [savedQueries, setSavedQueries] = useState<QueryEntry[]>([])
  const [exporting, setExporting] = useState(false)

  const floorsCleared = questProgress?.floorsCleared ?? []
  const completed = questProgress?.completed ?? false
  const hintsUsed = questProgress?.hintsUsed ?? []

  useEffect(() => {
    setUnlockedHints(new Set(hintsUsed))
  }, [hintsUsed])

  useEffect(() => {
    setActiveFloor(0)
    setQuery('')
    setResults(null)
    setQueryError(null)
    setClueVisible(false)
    setVerdictInput('')
    setVerdictResult(null)
    setSchemaOpen(false)
  }, [quest.id])

  useEffect(() => {
    let mounted = true

    async function bootDb() {
      const sqljs = await import('sql.js')
      const SQL = await sqljs.default({
        locateFile: () => '/sql-wasm.wasm',
      })
      const database = new SQL.Database()
      database.run(quest.seed)
      if (mounted) setDb(database)
    }

    bootDb()

    return () => {
      mounted = false
    }
  }, [quest.id])

  const floor = quest.floors[activeFloor]
  const isFloorCleared = floorsCleared.includes(activeFloor)
  const isFinalFloor = activeFloor === quest.floors.length - 1

  function canAccessFloor(idx: number) {
    if (idx === 0) return true
    return completed || floorsCleared.includes(idx - 1)
  }

  function saveQueryResult(resultSet: { columns: string[]; values: any[][] } | null) {
    const result = resultSet
      ? [resultSet.columns.join('\t'), ...resultSet.values.map(row => row.join('\t'))].join('\n')
      : ''

    setSavedQueries(prev => {
      const nextEntry: QueryEntry = {
        floorTitle: floor.title,
        query,
        result,
      }

      const existingIdx = prev.findIndex(entry => entry.floorTitle === floor.title)
      if (existingIdx >= 0) {
        const next = [...prev]
        next[existingIdx] = nextEntry
        return next
      }

      return [...prev, nextEntry]
    })
  }

  function runQuery() {
    if (!db || !query.trim()) {
      toast.error('Write a spell first.')
      return
    }

    setQueryError(null)
    setResults(null)

    try {
      const execResult = db.exec(query)
      const nextResults = execResult.length
        ? execResult[0]
        : { columns: ['Result'], values: [['Query ran with no rows returned.']] }

      setResults(nextResults)
      saveQueryResult(execResult.length ? execResult[0] : null)

      if (activeFloor < quest.floors.length - 1 && !isFloorCleared) {
        onClearFloor(quest.id, activeFloor).then(() => {
          toast.success(`Floor ${['I', 'II', 'III', 'IV'][activeFloor]} cleared.`)
        })
      }
    } catch (err: any) {
      setQueryError(err.message)
    }
  }

  async function checkVerdict() {
    if (!verdictInput.trim()) {
      toast.error('Enter your verdict first.')
      return
    }

    if (verdictInput.trim().toLowerCase() === quest.answer.toLowerCase()) {
      setVerdictResult('correct')

      if (!completed) {
        await onCompleteQuest(quest.id, quest.xp)
        toast.success(`Quest complete. +${quest.xp} XP`)
      }

      return
    }

    setVerdictResult('wrong')
    toast.error('The seal holds. Look deeper.')
  }

  async function revealHint(hint: Hint) {
    if (unlockedHints.has(hint.id)) return

    const ok = await onUseHint(quest.id, hint.id)
    if (ok) {
      setUnlockedHints(prev => new Set([...prev, hint.id]))
      toast.success('Hint revealed.')
    } else {
      toast.error('That hint could not be revealed.')
    }
  }

  async function handleExport(format: 'ipynb' | 'sql') {
    if (!savedQueries.length) {
      toast.error('Run at least one query first.')
      return
    }

    setExporting(true)

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id, format, queries: savedQueries }),
      })

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${quest.id}_${quest.title.replace(/\s+/g, '_')}.${format === 'ipynb' ? 'ipynb' : 'sql'}`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${format}.`)
    } catch {
      toast.error('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-rune/15 bg-gradient-to-b from-deep to-abyss px-8 py-6">
        <div className="mb-2 flex items-center gap-3">
          <span className={cn('border bg-white/0 px-2 py-0.5 font-cinzel text-[0.5rem] uppercase tracking-[0.15em]', quest.rankClass)}>
            {quest.rank}
          </span>
          {completed && (
            <span className="animate-glow-gold border border-gold/40 px-2 py-0.5 font-cinzel text-[0.5rem] uppercase tracking-[0.15em] text-gold">
              Completed
            </span>
          )}
          {saving && (
            <span className="animate-pulse font-cinzel text-[0.5rem] uppercase tracking-[0.15em] text-mist">
              Saving...
            </span>
          )}
        </div>

        <h1 className="font-cinzel text-2xl font-bold leading-snug text-parchment text-shadow-rune">
          {quest.title}
        </h1>
        <p className="mt-2 max-w-2xl font-crimson text-base italic leading-relaxed text-mist">
          {quest.lore}
        </p>

        {savedQueries.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleExport('ipynb')}
              disabled={exporting}
              className="border border-rune/25 px-3 py-1.5 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] text-rune-dim transition-colors hover:border-rune hover:text-rune disabled:opacity-50"
            >
              Export .ipynb
            </button>
            <button
              onClick={() => handleExport('sql')}
              disabled={exporting}
              className="border border-rune/25 px-3 py-1.5 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] text-rune-dim transition-colors hover:border-rune hover:text-rune disabled:opacity-50"
            >
              Export .sql
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-rune/15 bg-stone">
        {quest.floors.map((_, i) => {
          const cleared = floorsCleared.includes(i) || completed
          const locked = !canAccessFloor(i)
          const active = activeFloor === i

          return (
            <button
              key={i}
              onClick={() => {
                if (locked) {
                  toast.error('Clear the previous floor first.')
                  return
                }

                setActiveFloor(i)
                setResults(null)
                setQueryError(null)
                setClueVisible(false)
              }}
              className={cn(
                'border-r border-rune/10 px-5 py-3 font-cinzel text-[0.6rem] uppercase tracking-[0.15em] transition-colors',
                active && 'border-b-2 border-b-rune bg-rune/8 text-rune',
                !active && !locked && 'text-mist hover:text-parchment',
                locked && 'cursor-not-allowed text-mist/30',
                cleared && !active && 'text-gold-dim',
              )}
            >
              Floor {['I', 'II', 'III', 'IV'][i]}
              {cleared ? ' *' : ''}
            </button>
          )
        })}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-8 py-6">
        <div className="border border-rune/15 border-l-2 border-l-rune-dim bg-stone p-5">
          <h3 className="mb-1.5 font-cinzel text-sm text-gold">{floor.title}</h3>
          <p className="font-crimson text-base italic leading-relaxed text-mist">{floor.intro}</p>
        </div>

        <div>
          <button
            onClick={() => setSchemaOpen(value => !value)}
            className="flex w-full items-center gap-2 border-b border-rune/15 pb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.2em] text-rune-dim transition-colors hover:text-rune"
          >
            <span className={cn('transition-transform', schemaOpen && 'rotate-90')}>{'>'}</span>
            Database Schema
          </button>

          {schemaOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {Object.entries(quest.schema).map(([table, cols]) => (
                <div key={table} className="border border-rune/15 bg-deep p-3">
                  <div className="mb-2 font-cinzel text-[0.7rem] text-gold">{table}</div>
                  {cols.map(col => (
                    <div key={col.col} className="flex justify-between border-b border-rune/8 py-0.5 font-mono text-[0.65rem]">
                      <span className="text-parchment">
                        {col.pk ? 'PK ' : ''}
                        {col.col}
                      </span>
                      <span className="text-rune-dim">{col.type}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-cinzel text-[0.6rem] uppercase tracking-[0.2em] text-mist">Free Hints</p>
          <div className="flex flex-wrap gap-2">
            {floor.hints.map(hint => {
              const unlocked = unlockedHints.has(hint.id)

              return (
                <button
                  key={hint.id}
                  onClick={() => revealHint(hint)}
                  className={cn(
                    'max-w-xs border px-3 py-2 text-left font-cinzel text-[0.6rem] uppercase tracking-[0.12em] transition-all',
                    unlocked
                      ? 'cursor-default border-gold/30 bg-gold/5 text-gold'
                      : 'border-rune/20 bg-rune/5 text-rune-dim hover:border-rune hover:text-rune',
                  )}
                >
                  {unlocked ? `* ${hint.text}` : 'Reveal Hint'}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.2em] text-mist">Guided Reveal</p>
          <button
            onClick={() => setClueVisible(value => !value)}
            disabled={clueVisible}
            className="border border-rune/20 bg-rune/5 px-4 py-2 font-cinzel text-[0.65rem] uppercase tracking-[0.15em] text-rune transition-colors hover:bg-rune/15 disabled:cursor-default disabled:opacity-60"
          >
            {clueVisible ? 'Spell Revealed' : floor.clue.label}
          </button>

          {clueVisible && (
            <div className="mt-3 border border-rune/25 bg-deep p-5">
              <pre className="whitespace-pre-wrap font-mono text-[0.75rem] leading-relaxed text-rune">
                {floor.clue.query}
              </pre>
              <p className="mt-3 border-t border-rune/15 pt-3 font-crimson text-sm italic leading-relaxed text-mist">
                {floor.clue.desc}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 font-cinzel text-[0.6rem] uppercase tracking-[0.2em] text-gold-dim">
            Your Spell
          </p>
          <div className="border border-rune/20 bg-stone transition-colors focus-within:border-rune-dim">
            <div className="flex items-center justify-between border-b border-rune/15 bg-deep px-3 py-2">
              <span className="font-cinzel text-[0.6rem] uppercase tracking-[0.1em] text-rune-dim">SQL</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setQuery('')
                    setResults(null)
                    setQueryError(null)
                  }}
                  className="border border-rune/15 px-3 py-1 font-cinzel text-[0.6rem] uppercase tracking-widest text-mist transition-colors hover:border-rune/30 hover:text-parchment"
                >
                  Clear
                </button>
                <button
                  onClick={runQuery}
                  className="bg-rune-dim px-4 py-1 font-cinzel text-[0.6rem] uppercase tracking-widest text-parchment transition-colors hover:bg-rune"
                >
                  Cast Spell
                </button>
              </div>
            </div>

            <SQLEditor
              value={query}
              onChange={setQuery}
              placeholder={`-- ${floor.hint}\n-- Ctrl+Enter to run`}
              onRun={runQuery}
            />
          </div>

          {(results || queryError) && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between font-cinzel text-[0.6rem] uppercase tracking-[0.15em] text-mist">
                <span>Results</span>
                {results && (
                  <span className="text-gold-dim">
                    {results.values.length} row{results.values.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {queryError ? (
                <div className="border border-red-900/50 bg-red-950/20 p-4 font-mono text-[0.72rem] leading-relaxed text-red-400">
                  Spell misfired: {queryError}
                </div>
              ) : results ? (
                <div className="max-h-64 overflow-x-auto overflow-y-auto border border-rune/15">
                  <table className="w-full font-mono text-[0.7rem]">
                    <thead className="sticky top-0 bg-rune/8">
                      <tr>
                        {results.columns.map(column => (
                          <th
                            key={column}
                            className="whitespace-nowrap border-b border-rune-dim px-3 py-2 text-left text-[0.6rem] uppercase tracking-[0.1em] text-rune"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.values.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-rune/6 hover:bg-rune/5">
                          {row.map((value, valueIdx) => (
                            <td key={valueIdx} className="whitespace-nowrap px-3 py-2 text-parchment">
                              {value ?? 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {isFinalFloor && (
          <div className="border border-gold/20 bg-gradient-to-br from-stone to-abyss p-6">
            <p className="mb-4 font-cinzel text-[0.7rem] uppercase tracking-[0.2em] text-gold">
              Submit Your Verdict
            </p>
            <input
              type="text"
              value={verdictInput}
              onChange={event => setVerdictInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') void checkVerdict()
              }}
              placeholder={quest.answerHint}
              className="w-full border border-rune/20 bg-deep px-4 py-3 font-mono text-sm text-parchment outline-none transition-colors placeholder:text-mist/40 focus:border-rune-dim"
            />
            <button
              onClick={() => void checkVerdict()}
              className="mt-3 border border-gold/25 bg-gold/10 px-8 py-2.5 font-cinzel text-sm font-bold uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/20"
            >
              Seal the Case
            </button>

            {verdictResult === 'correct' && (
              <div className="mt-4 border border-green-800/40 bg-green-950/20 p-4 font-cinzel text-sm text-green-400">
                Correct. The dungeon falls. +{quest.xp} XP awarded.
              </div>
            )}

            {verdictResult === 'wrong' && (
              <div className="mt-4 border border-red-900/40 bg-red-950/20 p-4 font-cinzel text-sm text-red-400">
                "{verdictInput}" is not the answer. Recast your spells.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
