-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  email          text unique not null,
  password_hash  text not null,
  created_at     timestamp with time zone default now()
);

-- 2. Profiles Table (Global user settings)
CREATE TABLE profiles (
  user_id        uuid primary key references users(id) on delete cascade,
  xp             integer default 0,
  level          integer default 1,
  onboarded      boolean default false,
  updated_at     timestamp with time zone default now()
);

-- 3. User Heroes (The actual selected heroes with stats)
CREATE TABLE user_heroes (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references users(id) on delete cascade,
  hero_id        text not null, -- e.g. 'iron-will', 'ember-fist'
  total_xp       integer default 0,
  current_month_xp integer default 0,
  current_tier   integer default 0,
  created_at     timestamp with time zone default now(),
  unique(user_id, hero_id)
);

-- 4. Habits Table
CREATE TABLE habits (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references users(id) on delete cascade,
  hero_id        text, -- linked hero
  name           text not null,
  category       text not null,
  repeat_days    text[] not null, -- ['SU', 'MO', ...]
  priority       text default 'MEDIUM',
  goal_days      integer default 20,
  xp_value       integer default 10,
  frequency      text default 'daily',
  created_at     timestamp with time zone default now()
);

-- 5. Habit Logs
CREATE TABLE habit_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references users(id) on delete cascade,
  habit_id       uuid references habits(id) on delete cascade,
  log_date       date not null,
  completed      boolean default true,
  streak_count   integer default 0,
  created_at     timestamp with time zone default now(),
  unique(user_id, habit_id, log_date)
);

-- 6. Calendar Todos
CREATE TABLE calendar_todos (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references users(id) on delete cascade,
  todo_date      date not null,
  text           text not null,
  completed      boolean default false,
  created_at     timestamp with time zone default now()
);

-- 7. Goals Table
CREATE TABLE goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references users(id) on delete cascade,
  hero_id        text,
  title          text not null,
  target_value   integer not null,
  current_value  integer default 0,
  deadline       date,
  status         text default 'active',
  created_at     timestamp with time zone default now()
);
