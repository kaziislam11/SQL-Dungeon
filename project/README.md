# SQL:DUNGEON

> Gamified T-SQL learning through narrative dungeon mysteries.  
> CSCI 331 · Database Systems · Queens College CUNY · PPG_2

---

## Stack

| Layer    | Tech                                    |
|----------|-----------------------------------------|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS |
| Backend  | Next.js API Routes                      |
| Database | Supabase (Postgres + Auth)              |
| SQL Engine | sql.js (SQLite in-browser — no server queries for gameplay) |
| Editor   | CodeMirror 6 with SQL syntax highlighting |
| State    | Zustand + Supabase RLS                  |

---

## Project Structure

```
sqldungeon/
├── app/
│   ├── page.tsx                  # Landing / home page
│   ├── layout.tsx                # Root layout + fonts
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in
│   │   └── signup/page.tsx       # Create account
│   ├── dungeon/
│   │   └── page.tsx              # Protected dungeon app
│   ├── leaderboard/
│   │   └── page.tsx              # Guild hall leaderboard
│   └── api/
│       ├── auth/callback/route.ts # Email verification handler
│       ├── progress/route.ts      # GET/POST user progress (JSONB)
│       ├── leaderboard/route.ts   # Cached leaderboard
│       └── export/route.ts        # .ipynb / .sql export
│
├── components/
│   ├── dungeon/
│   │   ├── DungeonClient.tsx     # Main client shell
│   │   ├── DungeonSidebar.tsx    # Quest nav + XP bar
│   │   ├── QuestView.tsx         # Floor tabs, editor, hints, verdict
│   │   └── SQLEditor.tsx         # CodeMirror SQL editor
│
├── lib/
│   ├── quests.ts                 # All quest data + datasets
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client + admin
│   │   └── middleware.ts         # Session refresh + route protection
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state hook
│   │   └── useProgress.ts        # Single JSONB read/write progress hook
│   └── utils/
│       ├── cn.ts                 # clsx + tailwind-merge
│       ├── xp.ts                 # XP/rank utilities
│       └── notebook-export.ts    # .ipynb and .sql export builders
│
├── types/
│   └── index.ts                  # All shared TypeScript types
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # DB schema + RLS + triggers
│
├── middleware.ts                  # Route protection (Next.js)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd sqldungeon
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your URL and keys
3. Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the migration

Go to **Supabase Dashboard → SQL Editor** and paste the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Run it. This creates the `profiles` table, RLS policies, triggers, and leaderboard view.

### 4. Configure Auth email redirect

In **Supabase Dashboard → Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/api/auth/callback`

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Free Tier — How We Stay Under the Cap

| Concern | Strategy |
|---------|----------|
| **DB reads** | Progress stored as a single JSONB blob — 1 read per session, not per floor |
| **DB writes** | Write only on floor clear / quest complete — gameplay runs in-browser via sql.js |
| **Leaderboard reads** | ISR + Cache-Control: 60s stale-while-revalidate — 1 read/minute max |
| **Auth MAU (50k limit)** | Email auth only — no social providers adding extra counts |
| **Storage** | No file uploads — exports generated on-the-fly in memory |
| **Bandwidth** | sql.js WASM loaded from CDN, not Supabase storage |

---

## Features

- **Live SQL engine** — sql.js (SQLite in browser), zero server queries for gameplay
- **3 quests** with unique datasets per quest
- **4 floors per quest** — incremental difficulty, Section 4 = CTE boss fight
- **Guided clue reveals** — click to see reference query + explanation
- **Purchasable hints** — spend XP to unlock targeted hints per floor
- **Verdict system** — type your answer on Floor 4 to complete the quest
- **XP + Rank progression** — Apprentice Scribe → Grand Wizard of Data
- **Leaderboard** — top 20, ISR cached
- **Notebook export** — `.ipynb` (Jupyter) or `.sql` file for GitHub submission
- **Email auth** — Supabase Auth with email verification
- **Route protection** — middleware redirects unauthenticated users

---

## Submission

Push your completed quest notebooks and SQL files to your group's GitHub repo:

```bash
git add .
git commit -m "feat: complete Q001 The Merchant Who Never Ran Out"
git push
```

Submit the GitHub group link on Blackboard.

---

## Team

**PPG_2** · CSCI 331 · Queens College CUNY
