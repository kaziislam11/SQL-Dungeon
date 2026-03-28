// ─────────────────────────────────────────────────────────────
// types/index.ts — all shared types for SQL:DUNGEON
// ─────────────────────────────────────────────────────────────

// ── Quest & Floor ─────────────────────────────────────────
export type Rank = 'Mythic' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common'

export interface SchemaColumn {
  col:  string
  type: string
  pk?:  boolean
}

export interface FloorClue {
  label: string
  query: string
  desc:  string
}

export interface Hint {
  id:      number
  cost:    number   // XP cost to unlock
  text:    string
}

export interface Floor {
  title:  string
  intro:  string
  clue:   FloorClue
  hint:   string    // free inline hint (shown in editor placeholder)
  hints:  Hint[]    // purchasable hints
}

export interface Quest {
  id:        string
  title:     string
  rank:      Rank
  rankClass: string
  diff:      number  // 1-5 stars
  lore:      string
  answer:    string
  answerHint:string
  xp:        number
  schema:    Record<string, SchemaColumn[]>
  seed:      string  // SQL to seed the in-browser SQLite DB
  floors:    Floor[]
  tags:      string[]
  secret?:   boolean
  hiddenTitle?: string
}

// ── User Progress ─────────────────────────────────────────
// Stored as a single JSONB blob per user — minimizes Supabase reads/writes
export interface QuestProgress {
  questId:       string
  floorsCleared: number[]   // e.g. [0, 1, 2] = floors 1-3 done
  completed:     boolean
  hintsUsed:     number[]   // hint IDs used across this quest
  completedAt?:  string     // ISO timestamp
  timeSeconds?:  number     // total active time (optional timer)
}

export interface UserProgress {
  xp:       number
  quests:   Record<string, QuestProgress>  // keyed by quest id
  rank:     string
  teleportScrolls?: number
  revealedSecretQuestIds?: string[]
}

// ── Database types (mirrors Supabase schema) ──────────────
export interface DBProfile {
  id:           string   // = auth.users.id
  username:     string
  email:        string
  xp:           number
  progress:     UserProgress  // JSONB — single row, single column
  created_at:   string
  updated_at:   string
}

export interface DBLeaderboardEntry {
  id:          string
  username:    string
  xp:          number
  quests_done: number
  rank:        string
  updated_at:  string
}

// ── Auth ──────────────────────────────────────────────────
export interface AuthUser {
  id:       string
  email:    string
  username: string
}

// ── API responses ─────────────────────────────────────────
export interface ApiResponse<T> {
  data?:  T
  error?: string
}

// ── Export (notebook) ─────────────────────────────────────
export interface NotebookCell {
  type:    'markdown' | 'code'
  source:  string
  outputs?: string[]
}

export interface NotebookExport {
  questTitle: string
  exportedAt: string
  cells:      NotebookCell[]
}
