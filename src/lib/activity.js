const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

const dayKey = date => {
  const value = new Date(date)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export const startOfCurrentWeek = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return date
}

export const summarizeActivity = (activityLog = []) => {
  const weekStart = startOfCurrentWeek()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return { key: dayKey(date), day: DAY_NAMES[date.getDay()], xp: 0, words: 0, reviews: 0, conversations: 0 }
  })
  const byDay = new Map(days.map(day => [day.key, day]))
  let totalXP = 0
  let totalWords = 0
  let totalReviews = 0
  let conversations = 0
  let quizzes = 0
  const activeDays = new Set()

  activityLog.forEach(event => {
    const xp = Number(event.xp) || 0
    const words = Number(event.words) || 0
    totalXP += xp
    totalWords += words
    if (event.kind === 'flashcard') totalReviews += 1
    if (event.kind === 'chat') conversations += 1
    if (event.kind === 'quiz') quizzes += 1
    if (xp > 0 || words > 0) activeDays.add(dayKey(event.at))
    const day = byDay.get(dayKey(event.at))
    if (day) {
      day.xp += xp
      day.words += words
      if (event.kind === 'flashcard') day.reviews += 1
      if (event.kind === 'chat') day.conversations += 1
    }
  })

  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (activeDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    weeklyData: days,
    weeklyXP: days.reduce((sum, day) => sum + day.xp, 0),
    weeklyWords: days.reduce((sum, day) => sum + day.words, 0),
    totalXP,
    totalWords,
    totalReviews,
    conversations,
    quizzes,
    activeDayCount: activeDays.size,
    streak,
  }
}

export const cloudResultsToActivity = (results = []) => results.map(row => ({
  id: row.id,
  at: row.completed_at,
  xp: row.xp_earned,
  words: row.activity_type === 'flashcard' && row.score > 0 ? 1 : 0,
  kind: row.activity_type,
  languageCode: row.language_code,
}))
