import { Lock } from 'lucide-react'
import { summarizeActivity } from '../lib/activity'

const makeBadges = (user, activity) => [
  { id: 'first', emoji: '🌱', name: 'İlk Adım', desc: 'İlk çalışma etkinliğini tamamla', value: activity.totalReviews + activity.quizzes + activity.conversations, target: 1 },
  { id: 'words10', emoji: '📚', name: 'Kelime Avcısı', desc: '10 kelimeyi öğrenildi olarak işaretle', value: activity.totalWords, target: 10 },
  { id: 'reviews25', emoji: '🧠', name: 'Tekrar Ustası', desc: '25 tekrar kartı çalış', value: activity.totalReviews, target: 25 },
  { id: 'chat5', emoji: '🗣️', name: 'Konuşmaya Başladım', desc: 'Sesli koçla 5 mesaj çalış', value: activity.conversations, target: 5 },
  { id: 'quiz10', emoji: '🎯', name: 'Pratikçi', desc: '10 doğru pratik cevabı ver', value: activity.quizzes, target: 10 },
  { id: 'streak3', emoji: '🔥', name: 'Rutin Kurucu', desc: '3 günlük çalışma serisi yap', value: activity.streak, target: 3 },
  { id: 'xp500', emoji: '⭐', name: '500 XP', desc: 'Gerçek etkinliklerden 500 XP kazan', value: activity.totalXP, target: 500 },
  { id: 'polyglot', emoji: '🌍', name: 'Çok Dilli', desc: 'En az 3 aktif dil ekle', value: user.languages.length, target: 3 },
]

export default function Achievements({ user }) {
  const activity = summarizeActivity(user.activityLog)
  const badges = makeBadges(user, activity).map(badge => ({ ...badge, earned: badge.value >= badge.target, pct: Math.min(100, Math.round((badge.value / badge.target) * 100)) }))
  const earned = badges.filter(badge => badge.earned).length
  return <div>
    <div style={{ marginBottom: 28 }}><h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800 }}>🏆 <span className="gradient-text">Gerçek Başarılar</span></h1><p style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>{earned}/{badges.length} rozet kazandın · tüm rozetler çalışma kayıtlarından hesaplanır</p></div>
    <div className="glass-card animate-fade-in" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}><div style={{ fontSize: 48 }}>🎖️</div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Toplam İlerleme</div><div className="progress-bar" style={{ marginBottom: 6 }}><div className="progress-fill" style={{ width: `${Math.round((earned / badges.length) * 100)}%` }}/></div><div style={{ fontSize: 13, color: '#94a3b8' }}>{earned} / {badges.length} gerçek rozet</div></div></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>{badges.map((badge, index) => <div key={badge.id} className={`glass-card animate-fade-in delay-${Math.min(index + 1, 5)}`} style={{ padding: 24, textAlign: 'center', opacity: badge.earned ? 1 : .72, position: 'relative', overflow: 'hidden' }}>{badge.earned && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#7c3aed,#ec4899)' }}/>}<div style={{ width: 64, height: 64, margin: '0 auto 12px', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: badge.earned ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.05)', border: '1px solid var(--border)', position: 'relative' }}>{badge.emoji}{!badge.earned && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(10,10,26,.62)', borderRadius: 16 }}><Lock size={16} color="#64748b" /></div>}</div><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{badge.name}</div><div style={{ fontSize: 12, color: '#64748b', minHeight: 34 }}>{badge.desc}</div><div className="progress-bar" style={{ marginTop: 12, height: 5 }}><div className="progress-fill" style={{ width: `${badge.pct}%` }}/></div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{badge.earned ? 'Kazanıldı' : `${badge.value} / ${badge.target}`}</div></div>)}</div>
  </div>
}
