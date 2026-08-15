import { Brain, Check, Layers3 } from 'lucide-react'

const METHODS = [
  { id: 'sm2', icon: Brain, name: 'Akıllı tekrar (SM-2)', badge: 'Önerilen', description: 'Hatırlama puanına göre sonraki tekrar gününü kişiselleştirir. Anki ve SuperMemo yaklaşımına benzer.' },
  { id: 'leitner', icon: Layers3, name: 'Basit kutu sistemi', badge: 'Kolay', description: 'Bildiklerin daha seyrek, zorlandıkların daha sık gösterilir. Takibi daha anlaşılırdır.' },
]

export default function LearningSettings({ settings, setSettings }) {
  return <section className="settings-page animate-fade-in"><header><span className="studio-kicker">ÖĞRENME SİSTEMİ</span><h1>Nasıl tekrar etmek istersin?</h1><p>Yöntemi istediğin zaman değiştirebilirsin. Kart geçmişin korunur.</p></header>
    <div className="method-grid">{METHODS.map(method => { const Icon = method.icon; const active = settings.algorithm === method.id; return <button key={method.id} className={`method-card ${active ? 'active' : ''}`} onClick={() => setSettings(current => ({ ...current, algorithm: method.id }))}><div className="method-icon"><Icon size={23} /></div><div><span className="method-badge">{method.badge}</span><h2>{method.name}</h2><p>{method.description}</p></div>{active && <div className="method-check"><Check size={15} /></div>}</button> })}</div>
    <div className="daily-goal"><div><h2>Günlük kelime ve kalıp hedefi</h2><p>Her dil için seri ve seviyene göre hazırlanacak yeni öğe sayısı.</p></div><div className="goal-options">{[20,25,30].map(value => <button key={value} className={settings.dailyGoal === value ? 'active' : ''} onClick={() => setSettings(current => ({ ...current, dailyGoal: value }))}>{value}<span>öğe</span></button>)}</div></div>
  </section>
}
