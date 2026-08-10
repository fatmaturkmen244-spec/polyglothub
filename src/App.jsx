import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Languages from './components/Languages'
import FlashCards from './components/FlashCards'
import Practice from './components/Practice'
import Chat from './components/Chat'
import Achievements from './components/Achievements'
import Auth from './components/Auth'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { loadCloudProgress, saveCloudProgress } from './lib/progress'

const INITIAL_USER = {
  name: 'Öğrenci',
  streak: 14,
  totalXP: 2480,
  weeklyGoal: 300,
  weeklyXP: 175,
  level: 8,
  nextLevelXP: 3000,
  languages: [
    { code: 'en', name: 'İngilizce', flag: '🇬🇧', level: 'B2', progress: 72, wordsLearned: 1240 },
    { code: 'es', name: 'İspanyolca', flag: '🇪🇸', level: 'A2', progress: 38, wordsLearned: 410 },
    { code: 'ja', name: 'Japonca', flag: '🇯🇵', level: 'A1', progress: 15, wordsLearned: 120 },
  ],
  weeklyData: [
    { day: 'Pzt', xp: 45, words: 12 },
    { day: 'Sal', xp: 30, words: 8 },
    { day: 'Çar', xp: 60, words: 18 },
    { day: 'Per', xp: 0,  words: 0  },
    { day: 'Cum', xp: 40, words: 11 },
    { day: 'Cmt', xp: 0,  words: 0  },
    { day: 'Paz', xp: 0,  words: 0  },
  ],
  badges: [
    { id: 1, emoji: '🔥', name: 'Ateş Yakan', desc: '7 günlük seri', earned: true },
    { id: 2, emoji: '⭐', name: 'Yıldız', desc: '1000 XP kazandı', earned: true },
    { id: 3, emoji: '📚', name: 'Kitap kurdu', desc: '500 kelime öğrendi', earned: true },
    { id: 4, emoji: '🏆', name: 'Şampiyon', desc: '30 günlük seri', earned: false },
    { id: 5, emoji: '🌍', name: 'Gezgin', desc: '3 dil öğrendi', earned: false },
    { id: 6, emoji: '💎', name: 'Elmas', desc: '5000 XP kazandı', earned: false },
  ]
}

const STORAGE_KEY = 'polyglothub-progress-v1'

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved?.user || !Array.isArray(saved.user.languages)) return null

    return {
      user: { ...INITIAL_USER, ...saved.user },
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

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  const gainXP = useCallback((xp) => {
    setUser(prev => ({ ...prev, totalXP: prev.totalXP + xp, weeklyXP: prev.weeklyXP + xp }))
    showNotif(`+${xp} XP kazandınız! 🎉`)
  }, [showNotif])

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

        if (!cloud.languages.length) {
          await saveCloudProgress(session.user.id, user, activeLanguage?.code)
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
            totalXP: cloud.profile.total_xp,
            streak: cloud.profile.streak,
            weeklyGoal: cloud.profile.weekly_goal,
            weeklyXP: cloud.profile.weekly_xp,
            level: cloud.profile.level,
            nextLevelXP: cloud.profile.next_level_xp,
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onSignOut={() => supabase?.auth.signOut()} />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 20px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard user={user} gainXP={gainXP} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'languages' && (
          <Languages user={user} allLanguages={ALL_LANGUAGES} setActiveLanguage={lang => { setActiveLanguage(lang); setActiveTab('flashcards') }} addLanguage={addLanguage} removeLanguage={removeLanguage} showNotif={showNotif} />
        )}
        {activeTab === 'flashcards' && (
          <FlashCards language={activeLanguage} gainXP={gainXP} />
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
      </main>
    </div>
  )
}
