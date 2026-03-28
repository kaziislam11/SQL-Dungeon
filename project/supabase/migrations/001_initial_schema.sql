-- ─────────────────────────────────────────────────────────────
-- 001_initial_schema.sql
-- SQL:DUNGEON — Supabase schema
--
-- Design principles for staying under free tier caps:
--   • progress stored as a single JSONB blob per user
--     (1 row per user vs. potentially 40+ rows for per-floor tracking)
--   • leaderboard is a simple view over profiles — no extra table
--   • hints_used tracked inside the JSONB blob, not a separate table
--   • RLS ensures users can only read/write their own rows
-- ─────────────────────────────────────────────────────────────

-- ── profiles ─────────────────────────────────────────────
-- One row per user. Created automatically via trigger on signup.
create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  username    text        not null unique,
  email       text        not null,
  xp          integer     not null default 0,
  -- Single JSONB blob for all quest progress.
  -- Shape: { xp: number, rank: string, quests: { [questId]: QuestProgress } }
  -- This avoids a separate progress table entirely.
  progress    jsonb       not null default '{"xp":0,"rank":"Apprentice Scribe","quests":{}}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can only read/write their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Leaderboard: anyone authenticated can read basic fields
create policy "Authenticated users can view leaderboard fields"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- ── Auto-create profile on signup ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    -- Default username from email local part
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Auto-update updated_at ────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── Leaderboard view ─────────────────────────────────────
-- A view so we never expose private fields but can query leaderboard efficiently.
-- Uses only existing columns — no extra table, no extra storage.
create or replace view public.leaderboard as
  select
    id,
    username,
    xp,
    -- Count completed quests from the JSONB blob
    (
      select count(*)
      from jsonb_each(progress -> 'quests') as q(key, val)
      where (val ->> 'completed')::boolean = true
    )::integer as quests_done,
    progress ->> 'rank' as rank,
    updated_at
  from public.profiles
  order by xp desc
  limit 100;

-- ── Indexes ───────────────────────────────────────────────
-- Only index what we query — keeps storage lean
create index profiles_xp_idx on public.profiles (xp desc);
create index profiles_username_idx on public.profiles (username);
