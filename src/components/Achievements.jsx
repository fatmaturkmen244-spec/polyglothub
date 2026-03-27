import { Lock } from 'lucide-react'

export default function Achievements({ user }) {
  const earned = user.badges.filter(b => b.earned).length
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800 }}>
          🏆 <span className="gradient-text">Başarılar</span>
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>
          {earned}/{user.badges.length} rozet kazandın
        </p>
      </div>

      {/* Overall progress */}
      <div className="glass-card animate-fade-in" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 48 }}>🎖️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Toplam İlerleme</div>
          <div className="progress-bar" style={{ marginBottom: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.round((earned / user.badges.length) * 100)}%` }}/>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{earned} / {user.badges.length} rozet</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {user.badges.map((badge, i) => (
          <div key={badge.id} className={`glass-card animate-fade-in delay-${Math.min(i+1, 5)}`}
            style={{
              padding: 24, textAlign: 'center',
              opacity: badge.earned ? 1 : 0.5,
              filter: badge.earned ? 'none' : 'grayscale(0.5)',
              position: 'relative', overflow: 'hidden'
            }}>
            {badge.earned && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg,#7c3aed,#ec4899)'
              }}/>
            )}
            <div style={{
              width: 64, height: 64, margin: '0 auto 12px',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              background: badge.earned ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
              border: badge.earned ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
              position: 'relative'
            }}>
              {badge.emoji}
              {!badge.earned && (
                <div style={{
                  position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
                  background:'rgba(10,10,26,0.6)',borderRadius:16
                }}>
                  <Lock size={16} color="#475569" />
                </div>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{badge.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{badge.desc}</div>
            {badge.earned && (
              <div className="badge badge-success" style={{ marginTop: 10, display: 'inline-flex' }}>Kazanıldı</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
