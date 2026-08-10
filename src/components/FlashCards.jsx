import { useState } from 'react'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import { scheduleReview } from '../lib/spacedRepetition'

const WORDS = {
  en: [
    { word: 'Serendipity', meaning: 'Güzel şeylere tesadüfen ulaşma', example: 'Finding that book was pure serendipity.' },
    { word: 'Ephemeral', meaning: 'Geçici, kısa ömürlü', example: 'Beauty is ephemeral.' },
    { word: 'Melancholy', meaning: 'Hüzün, keder', example: 'A feeling of deep melancholy.' },
    { word: 'Resilience', meaning: 'Dayanıklılık, toparlanma gücü', example: 'She showed great resilience.' },
    { word: 'Eloquent', meaning: 'Etkileyici biçimde konuşan', example: 'An eloquent speech.' },
    { word: 'Perseverance', meaning: 'Israr, kararlılıkla devam', example: 'Success requires perseverance.' },
  ],
  es: [
    { word: 'Madrugada', meaning: 'Sabahın erken saatleri', example: 'Me levanté de madrugada.' },
    { word: 'Sobremesa', meaning: 'Yemek sonrası sohbet', example: 'Disfrutamos la sobremesa.' },
    { word: 'Trasnochar', meaning: 'Geceyi uyanık geçirmek', example: 'Tuvimos que trasnochar.' },
    { word: 'Verguenza', meaning: 'Utanç, mahcubiyet', example: 'Qué vergüenza!' },
  ],
  ja: [
    { word: 'Komorebi', meaning: 'Yapraklar arasından süzülen ışık', example: '木漏れ日が美しい' },
    { word: 'Wabi-sabi', meaning: 'Kusurlu güzellik felsefesi', example: '侘び寂びの美しさ' },
    { word: 'Ikigai', meaning: 'Yaşam amacı', example: '生き甲斐を見つける' },
  ],
}

const DEFAULT_WORDS = [
  { word: 'Hello', meaning: 'Merhaba', example: 'Hello, how are you?' },
  { word: 'World', meaning: 'Dünya', example: 'Hello, World!' },
]

export default function FlashCards({ language, gainXP, learningSettings }) {
  const words = WORDS[language?.code] ?? DEFAULT_WORDS
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)

  const current = words[index]

  const answer = (correct) => {
    const reviewKey = `polyglothub-review-${language?.code}-${current.word}`
    try {
      const previous = JSON.parse(localStorage.getItem(reviewKey) || '{}')
      localStorage.setItem(reviewKey, JSON.stringify(scheduleReview(previous, correct, learningSettings?.algorithm)))
    } catch { /* Review scheduling remains optional when storage is unavailable. */ }
    setResults(prev => [...prev, correct])
    gainXP(correct ? 15 : 5)
    if (index + 1 >= words.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  const restart = () => {
    setIndex(0); setFlipped(false); setResults([]); setDone(false)
  }

  if (done) {
    const correct = results.filter(Boolean).length
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
        <div className="glass-card animate-fade-in" style={{ padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{correct === words.length ? '🏆' : '✨'}</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            Tur Tamamlandı!
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            {correct}/{words.length} doğru • {correct * 15 + (words.length - correct) * 5} XP kazandınız
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={restart}>Tekrar Dene</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800 }}>
            {language?.flag} {language?.name} Kelime Kartları
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{index + 1} / {words.length}</p>
        </div>
        <span className="badge badge-primary">{language?.level ?? 'A1'}</span>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 28, height: 6 }}>
        <div className="progress-fill" style={{ width: `${((index) / words.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div onClick={() => setFlipped(f => !f)}
        style={{
          perspective: 1000, cursor: 'pointer',
          marginBottom: 24, height: 260
        }}>
        <div style={{
          position: 'relative', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front */}
          <div className="glass-card" style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Kelime</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800 }} className="gradient-text">
              {current.word}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Çeviriyi görmek için tıkla</div>
          </div>

          {/* Back */}
          <div className="glass-card" style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)'
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase' }}>Anlamı</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 700, textAlign: 'center', padding: '0 20px' }}>
              {current.meaning}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '0 20px' }}>
              "{current.example}"
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={() => answer(false)}
          style={{
            flex: 1, padding: 16, border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, background: 'rgba(239,68,68,0.1)',
            color: '#fca5a5', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s ease'
          }}>
          <XCircle size={18} /> Bilmedim
        </button>
        <button onClick={() => answer(true)}
          style={{
            flex: 1, padding: 16, border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 12, background: 'rgba(16,185,129,0.1)',
            color: '#6ee7b7', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s ease'
          }}>
          <CheckCircle size={18} /> Bildim!
        </button>
      </div>
    </div>
  )
}
