import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { scheduleReview } from '../lib/spacedRepetition'

const FALLBACK_CARDS = [
  { word: 'Hello', meaning: 'Merhaba', example: 'Hello, how are you?', exampleMeaning: 'Merhaba, nasılsın?' },
  { word: 'Learn', meaning: 'Öğrenmek', example: 'I learn something new every day.', exampleMeaning: 'Her gün yeni bir şey öğrenirim.' },
]

export default function FlashCards({ language, gainXP, learningSettings }) {
  const [words, setWords] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCards = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const historyKey = `polyglothub-seen-cards-${language?.code}`
      const seen = JSON.parse(localStorage.getItem(historyKey) || '[]')
      const response = await fetch('/api/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: language?.name, level: language?.level, exclude: seen }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Yeni kartlar hazırlanamadı.')
      const cards = data.cards || []
      setWords(cards)
      localStorage.setItem(historyKey, JSON.stringify([...seen, ...cards.map(card => card.word)].slice(-80)))
    } catch (requestError) {
      setError(`${requestError.message} Geçici kartlar gösteriliyor.`)
      setWords(FALLBACK_CARDS)
    } finally {
      setIndex(0); setFlipped(false); setResults([]); setDone(false); setLoading(false)
    }
  }, [language?.code, language?.level, language?.name])

  useEffect(() => { loadCards() }, [loadCards])

  const current = words[index]
  const answer = correct => {
    const reviewKey = `polyglothub-review-${language?.code}-${current.word}`
    try {
      const previous = JSON.parse(localStorage.getItem(reviewKey) || '{}')
      localStorage.setItem(reviewKey, JSON.stringify(scheduleReview(previous, correct, learningSettings?.algorithm)))
    } catch { /* Browser storage is optional. */ }
    setResults(previous => [...previous, correct])
    gainXP(correct ? 15 : 5, { kind: 'flashcard', languageCode: language?.code, words: correct ? 1 : 0, score: correct ? 1 : 0, total: 1 })
    if (index + 1 >= words.length) setDone(true)
    else { setIndex(value => value + 1); setFlipped(false) }
  }

  if (loading) return <div className="vocab-empty"><RefreshCw size={34} className="spin-icon" /><h2>Yeni kelimeler hazırlanıyor…</h2><p>Seviyene uygun ve daha önce görmediğin kartlar seçiliyor.</p></div>
  if (!current) return <div className="vocab-empty"><h2>Kart bulunamadı</h2><button className="btn-primary" onClick={loadCards}>Yeniden dene</button></div>

  if (done) {
    const correct = results.filter(Boolean).length
    return <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}><div className="glass-card animate-fade-in" style={{ padding: 40 }}><div style={{ fontSize: 64, marginBottom: 16 }}>{correct === words.length ? '🏆' : '✨'}</div><h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Tur Tamamlandı!</h2><p style={{ color: '#94a3b8', marginBottom: 24 }}>{correct}/{words.length} doğru · sonraki tekrar tarihleri kaydedildi</p><div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}><button className="btn-primary" onClick={loadCards}><RefreshCw size={16} /> Farklı kelimeler getir</button></div></div></div>
  }

  return <div style={{ maxWidth: 580, margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><div><h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800 }}>{language?.flag} {language?.name} Tekrar Kartları</h1><p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{index + 1} / {words.length} · her turda farklı kelimeler</p></div><button className="btn-ghost" onClick={loadCards}><RefreshCw size={15} /> Yenile</button></div>
    {error && <p className="studio-error voice-error">{error}</p>}
    <div className="progress-bar" style={{ marginBottom: 28, height: 6 }}><div className="progress-fill" style={{ width: `${(index / words.length) * 100}%` }} /></div>
    <div onClick={() => setFlipped(value => !value)} style={{ perspective: 1000, cursor: 'pointer', marginBottom: 24, height: 280 }}><div style={{ position: 'relative', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .6s cubic-bezier(.4,0,.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}><div className="glass-card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: '#64748b', fontWeight: 600 }}>KELİME</div><div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800 }} className="gradient-text">{current.word}</div><div style={{ fontSize: 13, color: '#64748b' }}>Anlamını görmek için tıkla</div></div><div className="glass-card" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, background: 'rgba(124,58,237,.1)', borderColor: 'rgba(124,58,237,.3)' }}><div style={{ fontSize: 11, letterSpacing: 2, color: '#a78bfa', fontWeight: 600 }}>ANLAMI</div><div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 25, fontWeight: 700, textAlign: 'center' }}>{current.meaning}</div><div style={{ fontSize: 14, color: '#dbeafe', fontStyle: 'italic', textAlign: 'center' }}>“{current.example}”</div>{current.exampleMeaning && <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>{current.exampleMeaning}</div>}</div></div></div>
    <div style={{ display: 'flex', gap: 16 }}><button onClick={() => answer(false)} style={{ flex: 1, padding: 16, border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, background: 'rgba(239,68,68,.1)', color: '#fca5a5', fontWeight: 600, cursor: 'pointer' }}><XCircle size={18} /> Bilmedim</button><button onClick={() => answer(true)} style={{ flex: 1, padding: 16, border: '1px solid rgba(16,185,129,.3)', borderRadius: 12, background: 'rgba(16,185,129,.1)', color: '#6ee7b7', fontWeight: 600, cursor: 'pointer' }}><CheckCircle size={18} /> Bildim</button></div>
  </div>
}
