import { useMemo, useState } from 'react'
import { Brain, Check, RefreshCw, Sparkles, Target } from 'lucide-react'

const TOPICS = ['Günlük hayat', 'Seyahat', 'İş ve okul', 'Sosyal konuşma', 'Karışık']

export default function VocabularyCoach({ language, dailyGoal = 25 }) {
  const [count, setCount] = useState(dailyGoal)
  const [topic, setTopic] = useState('Günlük hayat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [learned, setLearned] = useState([])
  const learnedSet = useMemo(() => new Set(learned), [learned])

  const generatePlan = async () => {
    setLoading(true); setError(''); setLearned([])
    try {
      const response = await fetch('/api/vocabulary-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language.name, level: language.level, count, topic }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Günlük set hazırlanamadı.')
      setPlan(data)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  const toggleLearned = index => setLearned(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index])

  return <section className="vocab-coach animate-fade-in">
    <header className="vocab-header">
      <div><span className="studio-kicker"><Sparkles size={14} /> KİŞİSEL EZBER KOÇU</span><h1>{language.flag} {language.name} · {language.level} günlük seti</h1><p>Seviyene uygun kelime ve kalıpları örnek cümlelerle çalış. Bildiklerini işaretle, kalanlara odaklan.</p></div>
      <div className="vocab-score"><Brain size={28} /><strong>{learned.length}/{plan?.items?.length || count}</strong><span>tamamlandı</span></div>
    </header>

    <div className="vocab-controls">
      <label>Konu<select value={topic} onChange={event => setTopic(event.target.value)}>{TOPICS.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Set büyüklüğü<select value={count} onChange={event => setCount(Number(event.target.value))}><option value={20}>20 öğe</option><option value={25}>25 öğe</option><option value={30}>30 öğe</option></select></label>
      <button className="btn-primary" onClick={generatePlan} disabled={loading}>{loading ? <><RefreshCw size={16} className="spin-icon" /> Hazırlanıyor…</> : <><Sparkles size={16} /> Setimi hazırla</>}</button>
    </div>
    {error && <p className="studio-error vocab-error">{error}</p>}

    {!plan && !loading && <div className="vocab-empty"><Target size={38} /><h2>Bugünün seti hazır değil</h2><p>Konu ve öğe sayısını seçerek kişisel çalışma setini oluştur.</p></div>}
    {plan && <><div className="vocab-summary"><div><span>Bugünün odağı</span><strong>{plan.title}</strong></div><p>{plan.studyTip}</p></div>
      <div className="vocab-list">{plan.items.map((item, index) => <article key={`${item.term}-${index}`} className={`vocab-item ${learnedSet.has(index) ? 'learned' : ''}`}>
        <button className="learn-check" onClick={() => toggleLearned(index)} aria-label={learnedSet.has(index) ? 'Öğrenildi işaretini kaldır' : 'Öğrenildi olarak işaretle'}>{learnedSet.has(index) && <Check size={16} />}</button>
        <div className="vocab-number">{String(index + 1).padStart(2, '0')}</div>
        <div className="vocab-term"><span>{item.type === 'phrase' ? 'KALIP' : 'KELİME'}</span><h3>{item.term}</h3><p>{item.meaning}</p></div>
        <div className="vocab-example"><strong>{item.example}</strong><p>{item.exampleMeaning}</p>{item.note && <small>{item.note}</small>}</div>
      </article>)}</div></>}
  </section>
}
