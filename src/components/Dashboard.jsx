import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Flame, Target, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(17,17,39,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '8px 14px', fontSize: 12
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard({ user, gainXP, setActiveTab }) {
  const [chartType, setChartType] = useState('xp')
  const weeklyPct = Math.min(100, Math.round((user.weeklyXP / user.weeklyGoal) * 100))

  const statCards = [
    { icon: Flame, color: '#f59e0b', label: 'Günlük Seri', value: `${user.streak} gün`, bg: 'rgba(245,158,11,0.1)' },
    { icon: Target, color: '#7c3aed', label: 'Haftalık XP', value: `${user.weeklyXP}/${user.weeklyGoal}`, bg: 'rgba(124,58,237,0.1)' },
    { icon: TrendingUp, color: '#10b981', label: 'Toplam XP', value: user.totalXP.toLocaleString(), bg: 'rgba(16,185,129,0.1)' },
    { icon: Clock, color: '#06b6d4', label: 'Dil Sayısı', value: user.languages.length, bg: 'rgba(6,182,212,0.1)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
            Merhaba, <span className="gradient-text">{user.name} 👋</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 15 }}>
            Bugün öğrenmeye hazır mısın? {user.streak} günlük serini devam ettir!
          </p>
        </div>
        <button className="btn-primary animate-pulse-glow" onClick={() => setActiveTab('flashcards')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Derse Başla <ChevronRight size={16} />
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`glass-card animate-fade-in delay-${i+1}`}
              style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart + Weekly Goal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, flexWrap: 'wrap' }}>
        {/* Chart */}
        <div className="glass-card animate-fade-in delay-3" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Haftalık İstatistik</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['xp', 'words'].map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className={chartType === t ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '5px 14px', fontSize: 12 }}>
                  {t === 'xp' ? 'XP' : 'Kelimeler'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={user.weeklyData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={chartType} name={chartType === 'xp' ? 'XP' : 'Kelime'}
                stroke="#7c3aed" strokeWidth={2}
                fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Goal */}
        <div className="glass-card animate-fade-in delay-4" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Haftalık Hedef</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {/* Circle progress */}
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={70} cy={70} r={58} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={12}/>
                <circle cx={70} cy={70} r={58} fill="none"
                  stroke="url(#weekGrad)" strokeWidth={12}
                  strokeDasharray={`${2*Math.PI*58}`}
                  strokeDashoffset={`${2*Math.PI*58*(1-weeklyPct/100)}`}
                  strokeLinecap="round"/>
                <defs>
                  <linearGradient id="weekGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#ec4899"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 28, fontWeight: 800 }}>{weeklyPct}%</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>tamamlandı</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{user.weeklyXP}</span> / {user.weeklyGoal} XP
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Hedefe {user.weeklyGoal - user.weeklyXP} XP kaldı</div>
            </div>
          </div>
          <button className="btn-ghost" style={{ width: '100%', textAlign: 'center' }} onClick={() => gainXP(10)}>
            🎯 Pratik Yap (+10 XP)
          </button>
        </div>
      </div>

      {/* Active Languages */}
      <div className="animate-fade-in delay-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Aktif Diller</h2>
          <button className="btn-ghost" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => setActiveTab('languages')}>
            Tümünü Gör
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.languages.map((lang) => (
            <div key={lang.code} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>{lang.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{lang.name}</span>
                    <span className="badge badge-primary" style={{ marginLeft: 8 }}>{lang.level}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{lang.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${lang.progress}%` }}/>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>
                  {lang.wordsLearned.toLocaleString()} kelime öğrenildi
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
