export const scheduleReview = (previous = {}, remembered, algorithm = 'sm2') => {
  const now = new Date()
  if (algorithm === 'leitner') {
    const box = remembered ? Math.min((previous.box || 1) + 1, 5) : 1
    const intervals = [1, 2, 4, 8, 16]
    now.setDate(now.getDate() + intervals[box - 1])
    return { ...previous, box, interval: intervals[box - 1], dueAt: now.toISOString(), repetitions: (previous.repetitions || 0) + 1 }
  }
  const quality = remembered ? 4 : 1
  const repetitions = quality < 3 ? 0 : (previous.repetitions || 0) + 1
  const ease = Math.max(1.3, (previous.ease || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  const interval = quality < 3 ? 1 : repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round((previous.interval || 6) * ease)
  now.setDate(now.getDate() + interval)
  return { ...previous, ease, interval, repetitions, dueAt: now.toISOString() }
}
