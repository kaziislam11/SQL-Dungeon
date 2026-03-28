# SQL:DUNGEON — Claude Code Context Prompt

## What this project is
A full-stack gamified T-SQL learning app for a CSCI 331 (Database Systems) course at Queens College CUNY. Students solve detective-style SQL mysteries ("quests") in a dark fantasy dungeon theme. Built as a monorepo with Next.js 14 App Router.

---

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** Next.js 14 App Router (API routes in `/app/api/`)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **In-browser SQL engine:** sql.js (SQLite — runs entirely client-side, no server queries)
- **State management:** Zustand
- **Code editor:** CodeMirror 6 with SQL language support
- **Notifications:** react-hot-toast
- **Icons:** lucide-react
- **Export:** jszip (for .ipynb and .sql notebook downloads)

---

## Design Theme
Dark fantasy dungeon aesthetic. Key design tokens (already in tailwind.config.ts):
- `abyss` (#06040a) — background
- `deep` (#0d0917) — panels
- `stone` (#111020) — cards
- `rune` (#8b5cf6) — purple, primary accent
- `rune-dim` (#5b3fa6) — muted purple
- `gold` (#f0b429) — gold, secondary accent
- `gold-dim` (#a07820) — muted gold
- `parchment` (#e8d5a3) — body text
- `mist` (#7a7090) — muted text
- Fonts: `font-cinzel` (headers), `font-crimson` (body/italic), `font-mono` (code/SQL)

---

## Folder Structure
```
sqldungeon/
├── app/
│   ├── layout.tsx                  # Root layout — font imports, Toaster
│   ├── page.tsx                    # Landing/home page (the dungeon intro screen)
│   ├── auth/
│   │   ├── login/page.tsx          # Email login form
│   │   ├── signup/page.tsx         # Email signup form
│   │   └── callback/route.ts       # Supabase auth callback handler
│   ├── dungeon/
│   │   ├── layout.tsx              # Sidebar + main layout (authenticated)
│   │   └── page.tsx                # Quest selection / dungeon main view
│   ├── leaderboard/
│   │   └── page.tsx                # Guild Hall leaderboard
│   ├── profile/
│   │   └── page.tsx                # User profile + progress overview
│   └── api/
│       ├── progress/route.ts       # GET/POST user progress (JSONB upsert)
│       ├── leaderboard/route.ts    # GET leaderboard (cached, stale-while-revalidate)
│       └── export/route.ts         # POST — generate .ipynb or .sql file for download
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Shared button variants (rune, gold, ghost)
│   │   ├── Input.tsx               # Styled input
│   │   ├── Card.tsx                # Dungeon-themed card container
│   │   ├── Badge.tsx               # Quest rank badge (Legendary/Rare/Uncommon)
│   │   ├── XPBar.tsx               # XP progress bar with rank label
│   │   └── StarRating.tsx          # 1-5 star difficulty display
│   ├── auth/
│   │   ├── LoginForm.tsx           # Email + password login
│   │   └── SignupForm.tsx          # Email + password + username signup
│   ├── dungeon/
│   │   ├── QuestSidebar.tsx        # Left sidebar: quest list, XP, leaderboard button
│   │   ├── QuestHeader.tsx         # Quest title, lore, rank badge
│   │   ├── FloorTabs.tsx           # Floor I / II / III / IV tabs
│   │   ├── FloorContent.tsx        # Main floor view (schema, clue, editor, verdict)
│   │   ├── SchemaViewer.tsx        # Collapsible table schema display
│   │   ├── ClueReveal.tsx          # Guided query reveal button + display
│   │   ├── SQLEditor.tsx           # CodeMirror 6 SQL editor with run button
│   │   ├── ResultsTable.tsx        # Query results rendered as a table
│   │   ├── HintPanel.tsx           # XP-gated purchasable hints
│   │   ├── VerdictInput.tsx        # Floor 4 answer submission
│   │   ├── ExportButton.tsx        # Download .ipynb or .sql notebook
│   │   └── LeaderboardModal.tsx    # Guild Hall modal overlay
│   └── layout/
│       ├── Navbar.tsx              # Top nav (logo, profile, signout)
│       └── TorchFlicker.tsx        # Ambient torch light effect divs
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts               # Server Supabase client (createServerClient) + admin
│   │   └── middleware.ts           # Session refresh + route protection logic
│   ├── hooks/
│   │   ├── useAuth.ts              # User + profile state, auth listener
│   │   └── useProgress.ts          # JSONB progress read/write, floor clear, XP award
│   ├── utils/
│   │   ├── cn.ts                   # clsx + tailwind-merge helper
│   │   ├── xp.ts                   # getRank(), getXpToNextRank(), RANKS constant
│   │   └── notebook-export.ts      # buildNotebook() and buildSQLFile() for export
│   └── data/
│       └── quests.ts               # All 3 quest definitions with seed SQL, floors, hints
├── types/
│   └── index.ts                    # All shared TypeScript interfaces
├── middleware.ts                   # Next.js middleware (calls updateSession)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # DB schema, RLS, triggers, leaderboard view
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
└── .env.example
```

---

## Files Already Created
The following files exist and should NOT be recreated, only read and build on top of:
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.gitignore`
- `.env.example`
- `middleware.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/hooks/useAuth.ts`
- `lib/hooks/useProgress.ts`
- `lib/utils/cn.ts`
- `lib/utils/xp.ts`
- `lib/utils/notebook-export.ts`
- `types/index.ts`
- `supabase/migrations/001_initial_schema.sql`

## Files That Need To Be Built
Everything else. Priority order:
1. `lib/data/quests.ts` — the quest data (3 quests with seed SQL, floors, hints)
2. `app/layout.tsx` — root layout
3. `app/page.tsx` — landing page
4. `app/auth/login/page.tsx` + `app/auth/signup/page.tsx` + `app/auth/callback/route.ts`
5. `components/ui/*` — all shared UI components
6. `components/auth/*` — login and signup forms
7. `app/dungeon/layout.tsx` + `app/dungeon/page.tsx`
8. `components/dungeon/*` — all dungeon components
9. `app/leaderboard/page.tsx`
10. `app/profile/page.tsx`
11. `app/api/*` — all API routes
12. `styles/globals.css` — Tailwind base + font imports + any custom CSS

---

## Supabase Schema (already migrated)
```sql
-- profiles table (one row per user)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null unique,
  email      text not null,
  xp         integer not null default 0,
  progress   jsonb not null default '{"xp":0,"rank":"Apprentice Scribe","quests":{}}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- RLS enabled. Users can only read/write own row.
-- leaderboard is a VIEW over profiles, not a separate table.
-- progress JSONB shape: { xp: number, rank: string, quests: { [questId]: QuestProgress } }
```

---

## Key Architecture Decisions (don't change these)
1. **sql.js runs entirely in the browser.** Never try to run SQL on the server. The in-browser SQLite DB is seeded from quest.seed on mount and reset when switching quests.
2. **Progress is one JSONB blob per user.** Never create a separate progress table. Always upsert the whole blob via `useProgress.ts`.
3. **Supabase writes only on floor clear or quest complete.** Not on every query run. Query execution is local only.
4. **Leaderboard uses a Supabase VIEW** (`public.leaderboard`), not a separate table.
5. **Auth is Supabase email/password.** No OAuth in v1. Email confirmation should be disabled in Supabase dashboard for dev.
6. **Export generates .ipynb (Jupyter notebook) and .sql files** from the user's saved queries. Both download client-side via jszip, no server needed.
7. **Hints cost XP to unlock.** XP is deducted immediately and the hint ID is stored in `progress.quests[questId].hintsUsed`.

---

## The 3 Quests (already designed — implement in lib/data/quests.ts)

### Q001 — The Merchant Who Never Ran Out (Legendary, 150 XP)
Tables: `merchants`, `inventory`, `orders`, `sales`
Answer: `aldric`
- Floor I: Basic SELECT + WHERE on inventory
- Floor II: JOIN orders + sales, compare totals
- Floor III: Calculate stock variance with SUM + window functions
- Floor IV: Single CTE combining all evidence

### Q002 — The Curse of the Phantom Order (Rare, 200 XP)
Tables: `customers`, `orders` (with parent_order_id for recursion), `shipments`
Answer: `ghost_client`
- Floor I: Find unbilled shipments
- Floor II: JOIN to find who received them
- Floor III: Recursive CTE to trace order chain
- Floor IV: Full recursive CTE + shipment join

### Q003 — The Shapeshifter's Ledger (Uncommon, 250 XP)
Tables: `employees` (with base_name alias pattern), `payroll`, `work_logs`
Answer: `vex`
- Floor I: GROUP BY base_name to find duplicates
- Floor II: JOIN payroll, compare wages per identity
- Floor III: PIVOT wages by month (CASE WHEN pattern)
- Floor IV: CTE combining identity map + pattern match

Each quest needs 2-3 purchasable hints per floor (cost: 25-50 XP each).

---

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Instructions for Claude Code
- Always use TypeScript. No `any` types unless absolutely unavoidable.
- All client components need `'use client'` at the top.
- Use `cn()` from `@/lib/utils/cn` for all className merging.
- Use `createClient()` from `@/lib/supabase/client` in client components.
- Use `createClient()` from `@/lib/supabase/server` in server components and API routes.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- API routes should always validate the user session before doing anything.
- All dungeon UI should match the dark fantasy theme — use the Tailwind color tokens, font-cinzel for headings, font-crimson for body, font-mono for code.
- The landing page (app/page.tsx) is the home screen from the static HTML prototype — hero with orbiting portal rings, torch flicker, scrollable sections with tenets + quest previews + CTA button that navigates to /dungeon.
