-- ═══════════════════════════════════════════════════════════
-- Hero Ascension — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ── 1. users ──────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

comment on table users is 'App users. Password is bcrypt-hashed. Auth is handled by the FastAPI backend, not Supabase Auth.';


-- ── 2. user_heroes ────────────────────────────────────────────────────
create table if not exists user_heroes (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  hero_id           text not null,                  -- e.g. "iron-will"
  current_tier      int  not null default 0,         -- 0=base, 1, 2, 3=max
  total_xp          int  not null default 0,
  current_month_xp  int  not null default 0,         -- resets each month
  created_at        timestamptz not null default now(),

  unique(user_id, hero_id)                           -- one row per user+hero
);

comment on table user_heroes is 'Which heroes each user has selected, with their XP and tier.';


-- ── 3. habits ─────────────────────────────────────────────────────────
create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  hero_id     text not null,
  name        text not null,
  frequency   text not null default 'daily'          -- daily | weekdays | weekly
                check (frequency in ('daily', 'weekdays', 'weekly')),
  xp_value    int  not null default 10
                check (xp_value between 1 and 100),
  created_at  timestamptz not null default now()
);

comment on table habits is 'Daily habits each user has created, assigned to a hero.';


-- ── 4. habit_logs ─────────────────────────────────────────────────────
create table if not exists habit_logs (
  id            uuid primary key default gen_random_uuid(),
  habit_id      uuid not null references habits(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  log_date      date not null,
  completed     boolean not null default true,
  streak_count  int  not null default 0,

  unique(habit_id, user_id, log_date)               -- one log per habit per day
);

comment on table habit_logs is 'Daily completion records. One row per habit per day.';


-- ── 5. goals ──────────────────────────────────────────────────────────
create table if not exists goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  hero_id        text not null,
  title          text not null,
  target_value   int  not null default 100,
  current_value  int  not null default 0,
  deadline       date,
  status         text not null default 'active'
                   check (status in ('active', 'completed', 'failed')),
  created_at     timestamptz not null default now()
);

comment on table goals is 'Major long-term goals each user is working toward.';


-- ── 6. monthly_evaluations ────────────────────────────────────────────
create table if not exists monthly_evaluations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  hero_id          text not null,
  month            int  not null check (month between 1 and 12),
  year             int  not null,
  habits_target    int  not null default 0,
  habits_done      int  not null default 0,
  completion_rate  float not null default 0,
  xp_earned        int  not null default 0,
  evolved          boolean not null default false,
  new_tier         int  not null default 0,
  evaluated_at     timestamptz not null default now(),

  unique(user_id, hero_id, month, year)
);

comment on table monthly_evaluations is 'End-of-month hero evaluation results. One row per user+hero+month.';


-- ═══════════════════════════════════════════════════════════
-- Indexes — speeds up the most common queries
-- ═══════════════════════════════════════════════════════════

create index if not exists idx_habits_user        on habits(user_id);
create index if not exists idx_habits_hero        on habits(hero_id);
create index if not exists idx_habit_logs_user    on habit_logs(user_id);
create index if not exists idx_habit_logs_date    on habit_logs(log_date);
create index if not exists idx_habit_logs_habit   on habit_logs(habit_id);
create index if not exists idx_goals_user         on goals(user_id);
create index if not exists idx_user_heroes_user   on user_heroes(user_id);
create index if not exists idx_evals_user         on monthly_evaluations(user_id);


-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- The FastAPI backend uses the service-role key which bypasses
-- RLS, so these policies are a safety net for direct DB access.
-- ═══════════════════════════════════════════════════════════

alter table users              enable row level security;
alter table user_heroes        enable row level security;
alter table habits             enable row level security;
alter table habit_logs         enable row level security;
alter table goals              enable row level security;
alter table monthly_evaluations enable row level security;

-- Service role bypasses all RLS automatically — no policy needed.
-- These SELECT policies guard against accidental direct API access.

create policy "service_role_only" on users             using (false);
create policy "service_role_only" on user_heroes       using (false);
create policy "service_role_only" on habits            using (false);
create policy "service_role_only" on habit_logs        using (false);
create policy "service_role_only" on goals             using (false);
create policy "service_role_only" on monthly_evaluations using (false);
