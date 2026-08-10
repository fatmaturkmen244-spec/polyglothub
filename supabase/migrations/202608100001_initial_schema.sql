create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Öğrenci',
  avatar_url text,
  total_xp integer not null default 0 check (total_xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  weekly_goal integer not null default 300 check (weekly_goal > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_languages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  level text not null default 'A1' check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  progress integer not null default 0 check (progress between 0 and 100),
  words_learned integer not null default 0 check (words_learned >= 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, language_code)
);

create table public.practice_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  activity_type text not null check (activity_type in ('quiz', 'flashcard', 'chat')),
  score integer check (score >= 0),
  total_questions integer check (total_questions > 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  completed_at timestamptz not null default now()
);

create table public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  word_key text not null,
  correct_count integer not null default 0 check (correct_count >= 0),
  incorrect_count integer not null default 0 check (incorrect_count >= 0),
  next_review_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, language_code, word_key)
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create index user_languages_user_id_idx on public.user_languages(user_id);
create index practice_results_user_id_completed_at_idx on public.practice_results(user_id, completed_at desc);
create index flashcard_reviews_user_id_next_review_idx on public.flashcard_reviews(user_id, next_review_at);
create index user_achievements_user_id_idx on public.user_achievements(user_id);

alter table public.profiles enable row level security;
alter table public.user_languages enable row level security;
alter table public.practice_results enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.user_achievements enable row level security;

create policy "Users can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can manage their own languages"
on public.user_languages for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own practice results"
on public.practice_results for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own flashcard reviews"
on public.flashcard_reviews for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can view their own achievements"
on public.user_achievements for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Öğrenci'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
