alter table public.profiles
  add column if not exists weekly_xp integer not null default 0 check (weekly_xp >= 0),
  add column if not exists level integer not null default 1 check (level > 0),
  add column if not exists next_level_xp integer not null default 500 check (next_level_xp > 0);
