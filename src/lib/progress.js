import { supabase } from './supabase'

export const loadCloudProgress = async (userId) => {
  const [profileResult, languagesResult, practiceResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_languages').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('practice_results').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1000),
  ])

  if (profileResult.error) throw profileResult.error
  if (languagesResult.error) throw languagesResult.error
  if (practiceResult.error) throw practiceResult.error

  return { profile: profileResult.data, languages: languagesResult.data, practiceResults: practiceResult.data }
}

export const recordCloudActivity = async (userId, event) => {
  const result = await supabase.from('practice_results').insert({
    user_id: userId,
    language_code: event.languageCode || 'general',
    activity_type: event.kind,
    score: event.score ?? null,
    total_questions: event.total ?? null,
    xp_earned: event.xp,
    completed_at: event.at,
  }).select('id').single()
  if (result.error) throw result.error
  return result.data
}

export const saveCloudProgress = async (userId, user, activeLanguageCode) => {
  const profileResult = await supabase
    .from('profiles')
    .update({
      display_name: user.name,
      total_xp: user.totalXP,
      streak: user.streak,
      weekly_goal: user.weeklyGoal,
      weekly_xp: user.weeklyXP,
      level: user.level,
      next_level_xp: user.nextLevelXP,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileResult.error) throw profileResult.error

  if (user.languages.length) {
    const languagesResult = await supabase.from('user_languages').upsert(
      user.languages.map(language => ({
        user_id: userId,
        language_code: language.code,
        level: language.level,
        progress: language.progress,
        words_learned: language.wordsLearned,
        is_active: language.code === activeLanguageCode,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,language_code' },
    )

    if (languagesResult.error) throw languagesResult.error

    const languageCodes = user.languages.map(language => language.code).join(',')
    const deleteResult = await supabase
      .from('user_languages')
      .delete()
      .eq('user_id', userId)
      .not('language_code', 'in', `(${languageCodes})`)

    if (deleteResult.error) throw deleteResult.error
  } else {
    const deleteResult = await supabase.from('user_languages').delete().eq('user_id', userId)
    if (deleteResult.error) throw deleteResult.error
  }
}
