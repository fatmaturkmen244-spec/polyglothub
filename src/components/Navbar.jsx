import { BookOpen, BarChart2, Layers, Zap, Trophy, Globe, MessageCircle } from 'lucide-react'

const tabs = [
  { id: 'dashboard',    label: 'Ana Sayfa',   icon: BarChart2 },
  { id: 'languages',   label: 'Diller',       icon: Globe },
  { id: 'flashcards',  label: 'Kartlar',      icon: Layers },
  { id: 'practice',    label: 'Pratik',       icon: Zap },
  { id: 'chat',        label: 'AI Sohbet',    icon: MessageCircle },
  { id: 'achievements',label: 'Başarılar',    icon: Trophy },
]

export default function Navbar({ activeTab, setActiveTab, user }) {
  const levelPct = Math.round((user.totalXP / user.nextLevelXP) * 100)

  return (
    <nav style={{
      background: 'rgba(10,10,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Top bar */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            <BookOpen size={20} color="white" />
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800, fontSize: 20,
            background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>PolyglotHub</span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Seviye {user.level} • {user.totalXP.toLocaleString()} XP</div>
          </div>
          <div style={{ position: 'relative', width: 42, height: 42 }}>
            <svg width={42} height={42} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={21} cy={21} r={18} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3}/>
              <circle cx={21} cy={21} r={18} fill="none"
                stroke="url(#xpGrad)" strokeWidth={3}
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - levelPct / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700
            }}>{user.level}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '4px 10px' }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontWeight: 700, color: '#fcd34d', fontSize: 14 }}>{user.streak}</span>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        display: 'flex', gap: 4, overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', border: 'none', cursor: 'pointer',
                background: 'transparent', color: isActive ? '#a78bfa' : '#64748b',
                fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 600 : 500,
                fontSize: 14, borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
