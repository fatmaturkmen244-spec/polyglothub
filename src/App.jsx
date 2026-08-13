import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Languages from './components/Languages'
import FlashCards from './components/FlashCards'
import Practice from './components/Practice'
import Chat from './components/Chat'
import Achievements from './components/Achievements'
import DocumentStudio from './components/DocumentStudio'
import VocabularyCoach from './components/VocabularyCoach'
import LearningSettings from './components/LearningSettings'
import Auth from './components/Auth'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadCloudProgress, recordCloudActivity, saveCloudProgress } from './lib/progress'
import { cloudResultsToActivity, summarizeActivity } from './lib/activity'

const INITIAL_USER = {
  name: 'Öğrenci',
  streak: 0,
  totalXP: 0,
  weeklyGoal: 300,
  weeklyXP: 0,
  level: 1,
  nextLevelXP: 500,
  activityLog: [],
  languages: [
    { code: 'en', name: 'İngilizce', flag: '🇬🇧', level: 'A1', progress: 0, wordsLearned: 0 },
  ],
}

const STORAGE_KEY = 'polyglothub-progress-v1'

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved?.user || !Array.isArray(saved.user.languages)) return null
    const activityLog = Array.isArray(saved.user.activityLog) ? saved.user.activityLog : []
    const activity = summarizeActivity(activityLog)

    return {
      user: {
        ...INITIAL_USER,
        ...saved.user,
        activityLog,
        totalXP: activity.totalXP,
        weeklyXP: activity.weeklyXP,
        streak: activity.streak,
        level: Math.floor(activity.totalXP / 500) + 1,
        nextLevelXP: (Math.floor(activity.totalXP / 500) + 1) * 500,
      },
      activeLanguageCode: saved.activeLanguageCode,
    }
  } catch {
    return null
  }
}

/* Learnable languages for selection */
const ALL_LANGUAGES = [
  { code: 'en', name: 'İngilizce', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', name: 'İspanyolca', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Fransızca', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Almanca', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'İtalyanca', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portekizce', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ru', name: 'Rusça', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ja', name: 'Japonca', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh', name: 'Çince', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ar', name: 'Arapça', flag: '🇸🇦', nativeName: 'العربية' },
]

export default function App() {
  const [savedProgress] = useState(loadProgress)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(() => savedProgress?.user ?? INITIAL_USER)
  const [activeLanguage, setActiveLanguage] = useState(() => {
    const languages = savedProgress?.user.languages ?? INITIAL_USER.languages
    return languages.find(lang => lang.code === savedProgress?.activeLanguageCode) ?? languages[0] ?? INITIAL_USER.languages[0]
  })
  const [notification, setNotification] = useState(null)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [cloudProgressReady, setCloudProgressReady] = useState(!isSupabaseConfigured)
  const [theme, setTheme] = useState(() => localStorage.getItem('polyglothub-theme') || 'dark')
  const [learningSettings, setLearningSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('polyglothub-learning-settings')) || { algorithm: 'sm2', dailyGoal: 25 } } catch { return { algorithm: 'sm2', dailyGoal: 25 } }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('polyglothub-theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem('polyglothub-learning-settings', JSON.stringify(learningSettings)) }, [learningSettings])

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  const gainXP = useCallback((xp, details = {}) => {
    const event = { id: crypto.randomUUID(), at: new Date().toISOString(), xp, words: details.words || 0, kind: details.kind || 'quiz', languageCode: details.languageCode || activeLanguage?.code, score: details.score, total: details.total }
    setUser(prev => {
      const activityLog = [...(prev.activityLog || []), event]
      const summary = summarizeActivity(activityLog)
      const languages = event.words > 0 ? prev.languages.map(item => item.code === event.languageCode ? { ...item, wordsLearned: item.wordsLearned + event.words } : item) : prev.languages
      return { ...prev, activityLog, languages, totalXP: summary.totalXP, weeklyXP: summary.weeklyXP, streak: summary.streak, level: Math.floor(summary.totalXP / 500) + 1, nextLevelXP: (Math.floor(summary.totalXP / 500) + 1) * 500 }
    })
    if (session?.user?.id) recordCloudActivity(session.user.id, event).catch(error => showNotif(`Etkinlik kaydedilemedi: ${error.message}`, 'error'))
    showNotif(`+${xp} XP kazandınız! 🎉`)
  }, [activeLanguage?.code, session?.user?.id, showNotif])

  const addLanguage = useCallback((lang) => {
    setUser(prev => {
      if (prev.languages.find(l => l.code === lang.code)) return prev
      const newLang = { code: lang.code, name: lang.name, flag: lang.flag, level: 'A1', progress: 0, wordsLearned: 0 }
      return { ...prev, languages: [...prev.languages, newLang] }
    })
    showNotif(`${lang.flag} ${lang.name} listenize eklendi!`)
  }, [showNotif])

  const removeLanguage = useCallback((code) => {
    setUser(prev => ({ ...prev, languages: prev.languages.filter(l => l.code !== code) }))
    setActiveLanguage(prev => prev?.code === code ? INITIAL_USER.languages[0] : prev)
    showNotif('Dil listenizden kaldırıldı', 'error')
  }, [showNotif])

  const resetLanguageProgress = useCallback((code) => {
    setUser(prev => ({ ...prev, languages: prev.languages.map(language => language.code === code ? { ...language, level: 'A1', progress: 0, wordsLearned: 0 } : language) }))
    showNotif('Dil ilerlemesi sıfırlandı')
  }, [showNotif])

  useEffect(() => {
    document.title = 'PolyglotHub | Dil Öğrenme Platformu'
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return

    let active = true
    const load = async () => {
      try {
        const cloud = await loadCloudProgress(session.user.id)
        if (!active) return
        const activityLog = cloudResultsToActivity(cloud.practiceResults)
        const activity = summarizeActivity(activityLog)
        const activityFields = {
          totalXP: activity.totalXP,
          streak: activity.streak,
          weeklyXP: activity.weeklyXP,
          level: Math.floor(activity.totalXP / 500) + 1,
          nextLevelXP: (Math.floor(activity.totalXP / 500) + 1) * 500,
          activityLog,
        }

        if (!cloud.languages.length) {
          const normalizedUser = { ...user, ...activityFields, name: cloud.profile.display_name, weeklyGoal: cloud.profile.weekly_goal }
          setUser(normalizedUser)
          await saveCloudProgress(session.user.id, normalizedUser, activeLanguage?.code)
        } else {
          const languages = cloud.languages.map(row => {
            const catalogLanguage = ALL_LANGUAGES.find(language => language.code === row.language_code)
            return {
              code: row.language_code,
              name: catalogLanguage?.name ?? row.language_code.toUpperCase(),
              flag: catalogLanguage?.flag ?? '🌐',
              level: row.level,
              progress: row.progress,
              wordsLearned: row.words_learned,
            }
          })
          const activeCode = cloud.languages.find(row => row.is_active)?.language_code
          const nextUser = {
            ...user,
            name: cloud.profile.display_name,
            weeklyGoal: cloud.profile.weekly_goal,
            ...activityFields,
            languages,
          }
          setUser(nextUser)
          setActiveLanguage(languages.find(language => language.code === activeCode) ?? languages[0])
        }
        setCloudProgressReady(true)
      } catch (error) {
        if (!active) return
        showNotif(`İlerleme yüklenemedi: ${error.message}`, 'error')
        setCloudProgressReady(true)
      }
    }

    load()
    return () => { active = false }
    // Local progress is intentionally captured once when the signed-in account loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, showNotif])

  useEffect(() => {
    if (!session?.user?.id || !cloudProgressReady) return

    const timeout = setTimeout(() => {
      saveCloudProgress(session.user.id, user, activeLanguage?.code).catch(error => {
        showNotif(`İlerleme kaydedilemedi: ${error.message}`, 'error')
      })
    }, 500)

    return () => clearTimeout(timeout)
  }, [user, activeLanguage?.code, session?.user?.id, cloudProgressReady, showNotif])

  useEffect(() => {
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setAuthLoading(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setCloudProgressReady(false)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user,
        activeLanguageCode: activeLanguage?.code,
      }))
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, [user, activeLanguage?.code])

  if (authLoading || (session && !cloudProgressReady)) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>PolyglotHub yükleniyor…</main>
  }

  if (isSupabaseConfigured && !session) return <Auth />

  return (
    <div className="app-shell">
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: notification.type === 'success'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', padding: '12px 20px', borderRadius: 12,
          fontWeight: 600, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {notification.msg}
        </div>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} theme={theme} setTheme={setTheme} onSignOut={() => supabase?.auth.signOut()} />

      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard user={user} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'languages' && (
          <Languages user={user} allLanguages={ALL_LANGUAGES} setActiveLanguage={lang => { setActiveLanguage(lang); setActiveTab('flashcards') }} addLanguage={addLanguage} removeLanguage={removeLanguage} resetLanguageProgress={resetLanguageProgress} showNotif={showNotif} />
        )}
        {activeTab === 'flashcards' && (
          <FlashCards language={activeLanguage} gainXP={gainXP} learningSettings={learningSettings} />
        )}
        {activeTab === 'practice' && (
          <Practice language={activeLanguage} gainXP={gainXP} />
        )}
        {activeTab === 'chat' && (
          <Chat key={activeLanguage?.code} language={activeLanguage} userLanguages={user.languages} setActiveLanguage={setActiveLanguage} gainXP={gainXP} />
        )}
        {activeTab === 'achievements' && (
          <Achievements user={user} />
        )}
        {activeTab === 'documents' && <DocumentStudio />}
        {activeTab === 'vocabulary' && <VocabularyCoach language={activeLanguage} dailyGoal={learningSettings.dailyGoal} gainXP={gainXP} />}
        {activeTab === 'settings' && <LearningSettings settings={learningSettings} setSettings={setLearningSettings} />}
      </main>
    </div>
  )
}
