import { useMemo, useState } from 'react'
import { Brain, Check, RefreshCw, Sparkles, Target } from 'lucide-react'

const TOPICS = ['Günlük hayat', 'Seyahat', 'İş ve okul', 'Sosyal konuşma', 'Karışık']
const PROFESSION_GROUPS = {
  'Eğitim ve Akademi': ['Öğrenci', 'Öğretmen', 'Okul öncesi öğretmeni', 'Rehber öğretmen', 'Akademisyen', 'Araştırma görevlisi', 'Okul yöneticisi', 'Özel eğitim uzmanı'],
  'Sağlık ve Tıp': ['Doktor', 'Hemşire', 'Diş hekimi', 'Eczacı', 'Psikolog', 'Fizyoterapist', 'Diyetisyen', 'Veteriner', 'Paramedik', 'Tıbbi laboratuvar uzmanı'],
  'Yazılım ve Bilişim': ['Yazılım geliştirici', 'Web geliştirici', 'Mobil uygulama geliştirici', 'Veri bilimci', 'Yapay zekâ uzmanı', 'Siber güvenlik uzmanı', 'Sistem yöneticisi', 'Ürün yöneticisi', 'UI/UX tasarımcısı', 'Teknik destek uzmanı'],
  'Mühendislik ve Mimarlık': ['Bilgisayar mühendisi', 'Elektrik-elektronik mühendisi', 'Makine mühendisi', 'İnşaat mühendisi', 'Endüstri mühendisi', 'Kimya mühendisi', 'Çevre mühendisi', 'Mimar', 'İç mimar', 'Şehir plancısı'],
  'Hukuk ve Güvenlik': ['Avukat', 'Hâkim', 'Savcı', 'Hukuk danışmanı', 'Arabulucu', 'Polis', 'İtfaiyeci', 'İş güvenliği uzmanı', 'Özel güvenlik görevlisi'],
  'Finans ve Muhasebe': ['Muhasebeci', 'Mali müşavir', 'Banka çalışanı', 'Finans analisti', 'Denetçi', 'Ekonomist', 'Sigorta uzmanı', 'Yatırım danışmanı', 'Vergi uzmanı'],
  'İşletme, İK ve Yönetim': ['İnsan kaynakları uzmanı', 'Proje yöneticisi', 'Operasyon yöneticisi', 'Ofis yöneticisi', 'Yönetici asistanı', 'İş analisti', 'Girişimci', 'Üst düzey yönetici', 'Müşteri ilişkileri uzmanı'],
  'Satış ve Pazarlama': ['Satış temsilcisi', 'Pazarlama uzmanı', 'Dijital pazarlama uzmanı', 'Marka yöneticisi', 'Sosyal medya uzmanı', 'E-ticaret uzmanı', 'Halkla ilişkiler uzmanı', 'Pazar araştırmacısı', 'Mağaza yöneticisi'],
  'Turizm, Otelcilik ve Yeme-İçme': ['Turist rehberi', 'Otel resepsiyonisti', 'Otel yöneticisi', 'Seyahat danışmanı', 'Kabin memuru', 'Aşçı', 'Garson', 'Barista', 'Pastacı', 'Etkinlik yöneticisi'],
  'Medya, İletişim ve Sanat': ['Gazeteci', 'Editör', 'Çevirmen', 'İçerik yazarı', 'Sunucu', 'Fotoğrafçı', 'Video editörü', 'Müzisyen', 'Oyuncu', 'Yapımcı'],
  'Tasarım ve Moda': ['Grafik tasarımcı', 'Moda tasarımcısı', 'Endüstriyel tasarımcı', 'Animatör', 'İllüstratör', 'Oyun tasarımcısı', 'Dekoratör', 'Terzi', 'Kuyumcu'],
  'Üretim ve Teknik Meslekler': ['Üretim operatörü', 'Kalite kontrol uzmanı', 'Teknisyen', 'Elektrikçi', 'Kaynakçı', 'Tornacı', 'Oto tamircisi', 'Mobilya ustası', 'Makine operatörü', 'Bakım uzmanı'],
  'Lojistik ve Ulaşım': ['Lojistik uzmanı', 'Tedarik zinciri uzmanı', 'Depo sorumlusu', 'Satın alma uzmanı', 'Gümrük müşaviri', 'Şoför', 'Pilot', 'Gemi kaptanı', 'Kurye', 'Tren makinisti'],
  'Kamu ve Sosyal Hizmetler': ['Memur', 'Sosyal hizmet uzmanı', 'Sosyolog', 'Belediye çalışanı', 'Diplomat', 'Kütüphaneci', 'Arşiv uzmanı', 'Din görevlisi', 'Sivil toplum çalışanı'],
  'Tarım, Doğa ve Hayvancılık': ['Çiftçi', 'Ziraat mühendisi', 'Gıda mühendisi', 'Veteriner sağlık teknikeri', 'Peyzaj mimarı', 'Orman mühendisi', 'Balıkçılık uzmanı', 'Hayvan yetiştiricisi', 'Arıcı'],
}

export default function VocabularyCoach({ language, dailyGoal = 25 }) {
  const [count, setCount] = useState(dailyGoal)
  const [topic, setTopic] = useState('Günlük hayat')
  const [professionGroup, setProfessionGroup] = useState(Object.keys(PROFESSION_GROUPS)[0])
  const [profession, setProfession] = useState(PROFESSION_GROUPS[Object.keys(PROFESSION_GROUPS)[0]][0])
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
        body: JSON.stringify({ language: language.name, level: language.level, count, topic, professionGroup: topic === 'İş ve okul' ? professionGroup : '', profession: topic === 'İş ve okul' ? profession : '' }),
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

    <div className={`vocab-controls ${topic === 'İş ve okul' ? 'has-profession' : ''}`}>
      <label>Konu<select value={topic} onChange={event => { setTopic(event.target.value); setPlan(null); setLearned([]) }}>{TOPICS.map(item => <option key={item}>{item}</option>)}</select></label>
      {topic === 'İş ve okul' && <>
        <label>Meslek grubu<select value={professionGroup} onChange={event => { const group = event.target.value; setProfessionGroup(group); setProfession(PROFESSION_GROUPS[group][0]); setPlan(null); setLearned([]) }}>{Object.keys(PROFESSION_GROUPS).map(group => <option key={group}>{group}</option>)}</select></label>
        <label>Meslek / rol<select value={profession} onChange={event => { setProfession(event.target.value); setPlan(null); setLearned([]) }}>{PROFESSION_GROUPS[professionGroup].map(item => <option key={item}>{item}</option>)}</select></label>
      </>}
      <label>Set büyüklüğü<select value={count} onChange={event => setCount(Number(event.target.value))}><option value={20}>20 öğe</option><option value={25}>25 öğe</option><option value={30}>30 öğe</option></select></label>
      <button className="btn-primary" onClick={generatePlan} disabled={loading}>{loading ? <><RefreshCw size={16} className="spin-icon" /> Hazırlanıyor…</> : <><Sparkles size={16} /> Setimi hazırla</>}</button>
    </div>
    {error && <p className="studio-error vocab-error">{error}</p>}

    {!plan && !loading && <div className="vocab-empty"><Target size={38} /><h2>Bugünün seti hazır değil</h2><p>{topic === 'İş ve okul' ? `${professionGroup} · ${profession} için mesleki çalışma setini oluştur.` : 'Konu ve öğe sayısını seçerek kişisel çalışma setini oluştur.'}</p></div>}
    {plan && <><div className="vocab-summary"><div><span>Bugünün odağı</span><strong>{plan.title}</strong></div><p>{plan.studyTip}</p></div>
      <div className="vocab-list">{plan.items.map((item, index) => <article key={`${item.term}-${index}`} className={`vocab-item ${learnedSet.has(index) ? 'learned' : ''}`}>
        <button className="learn-check" onClick={() => toggleLearned(index)} aria-label={learnedSet.has(index) ? 'Öğrenildi işaretini kaldır' : 'Öğrenildi olarak işaretle'}>{learnedSet.has(index) && <Check size={16} />}</button>
        <div className="vocab-number">{String(index + 1).padStart(2, '0')}</div>
        <div className="vocab-term"><span>{item.type === 'phrase' ? 'KALIP' : 'KELİME'}</span><h3>{item.term}</h3><p>{item.meaning}</p></div>
        <div className="vocab-example"><strong>{item.example}</strong><p>{item.exampleMeaning}</p>{item.note && <small>{item.note}</small>}</div>
      </article>)}</div></>}
  </section>
}
