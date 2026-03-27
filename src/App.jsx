import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Languages from './components/Languages'
import FlashCards from './components/FlashCards'
import Practice from './components/Practice'
import Chat from './components/Chat'
import Achievements from './components/Achievements'

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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(INITIAL_USER)
  const [activeLanguage, setActiveLanguage] = useState(INITIAL_USER.languages[0])
  const [notification, setNotification] = useState(null)

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

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 20px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard user={user} gainXP={gainXP} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'languages' && (
          <Languages user={user} allLanguages={ALL_LANGUAGES} setActiveLanguage={lang => { setActiveLanguage(lang); setActiveTab('flashcards') }} addLanguage={addLanguage} removeLanguage={removeLanguage} showNotif={showNotif} />
        )}
        {activeTab === 'flashcards' && (
          <FlashCards language={activeLanguage} userLanguages={user.languages} setActiveLanguage={setActiveLanguage} gainXP={gainXP} showNotif={showNotif} />
        )}
        {activeTab === 'practice' && (
          <Practice language={activeLanguage} userLanguages={user.languages} setActiveLanguage={setActiveLanguage} gainXP={gainXP} showNotif={showNotif} />
        )}
        {activeTab === 'chat' && (
          <Chat language={activeLanguage} userLanguages={user.languages} setActiveLanguage={setActiveLanguage} gainXP={gainXP} />
        )}
        {activeTab === 'achievements' && (
          <Achievements user={user} />
        )}
      </main>
    </div>
  )
}
