import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const QUIZZES = {
  en: [
    { question: 'What does "Ephemeral" mean?', options: ['Kalıcı', 'Geçici', 'Güçlü', 'Sessiz'], answer: 1 },
    { question: '"Resilience" kelimesinin anlamı nedir?', options: ['Yıkım', 'Korkuşma', 'Dayanıklılık', 'Özgürlük'], answer: 2 },
    { question: 'Which word means "Hüzün"?', options: ['Joy', 'Anger', 'Melancholy', 'Surprise'], answer: 2 },
    { question: '"Eloquent" ne demektir?', options: ['Sessiz', 'Çirkin', 'Etkileyici konuşan', 'Güçlü'], answer: 2 },
  ],
  es: [
    { question: '"Madrugada" ne demektir?', options: ['Öğleden sonra', 'Sabahın erken saatleri', 'Gece yarısı', 'Akşam'], answer: 1 },
    { question: 'What is "Sobremesa"?', options: ['A meal', 'Post-dinner chat', 'Table cloth', 'Dessert'], answer: 1 },
  ],
  ja: [
    { question: '"Ikigai" ne anlama gelir?', options: ['Yemek', 'Yaşam amacı', 'Gece', 'Deniz'], answer: 1 },
    { question: '"Komorebi" nedir?', options: ['Rüzgar sesi', 'Yaprak sesleri', 'Yapraklar arasından süzülen ışık', 'Kar'], answer: 2 },
  ],
}

const DEFAULT_QUIZ = [
  { question: 'What does "Hello" mean?', options: ['Güle güle', 'Merhaba', 'Teşekkür', 'Evet'], answer: 1 },
  { question: '"World" kelimesinin anlamı?', options: ['Kelime', 'Dünya', 'Ev', 'Ülke'], answer: 1 },
]

export default function Practice({ language, gainXP }) {
  const quiz = QUIZZES[language?.code] ?? DEFAULT_QUIZ
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const current = quiz[qIndex]

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === current.answer
    if (correct) { setScore(s => s + 1); gainXP(20) }

    setTimeout(() => {
      if (qIndex + 1 >= quiz.length) {
        setDone(true)
      } else {
        setQIndex(q => q + 1)
        setSelected(null)
      }
    }, 1000)
  }

  const restart = () => { setQIndex(0); setSelected(null); setScore(0); setDone(false) }

  if (done) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
        <div className="glass-card animate-fade-in" style={{ padding: 44 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Quiz Bitti!</h2>
          <p style={{ color: '#94a3b8', marginBottom: 8 }}>{score}/{quiz.length} doğru</p>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }} className="gradient-text">
            {pct}%
          </div>
          <button className="btn-primary" onClick={restart}>Tekrar Oyna</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800 }}>
          {language?.flag} Pratik Testi
        </h1>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>{qIndex + 1} / {quiz.length}</span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 32, height: 5 }}>
        <div className="progress-fill" style={{ width: `${(qIndex / quiz.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="glass-card animate-fade-in" style={{ padding: '28px 30px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
          Soru {qIndex + 1}
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700 }}>{current.question}</div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {current.options.map((opt, i) => {
          let borderColor = 'rgba(255,255,255,0.1)'
          let bg = 'rgba(255,255,255,0.04)'
          let color = '#f8fafc'
          if (selected !== null) {
            if (i === current.answer) { borderColor = 'rgba(16,185,129,0.5)'; bg = 'rgba(16,185,129,0.1)'; color = '#6ee7b7' }
            else if (i === selected && i !== current.answer) { borderColor = 'rgba(239,68,68,0.5)'; bg = 'rgba(239,68,68,0.1)'; color = '#fca5a5' }
          }
          return (
            <button key={i} onClick={() => choose(i)}
              style={{
                padding: '16px 20px', borderRadius: 12, border: `1px solid ${borderColor}`,
                background: bg, color, cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15,
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                transition: 'all 0.3s ease'
              }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {selected !== null && i === current.answer && <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
              {selected !== null && i === selected && i !== current.answer && <XCircle size={16} color="#ef4444" style={{ marginLeft: 'auto' }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
