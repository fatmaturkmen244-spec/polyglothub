import { ChevronRight, PlusCircle, Trash2, BookOpen } from 'lucide-react'
import { useState } from 'react'

const LEVEL_COLORS = {
  A1: '#10b981', A2: '#06b6d4', B1: '#7c3aed',
  B2: '#ec4899', C1: '#f59e0b', C2: '#ef4444'
}

export default function Languages({ user, allLanguages, setActiveLanguage, addLanguage, removeLanguage, showNotif }) {
  const [confirmRemove, setConfirmRemove] = useState(null)
  const activeCodes = user.languages.map(l => l.code)

  const handleAdd = (lang) => {
    if (activeCodes.includes(lang.code)) {
      showNotif(`${lang.flag} ${lang.name} zaten eklendi, öğrenmeye devam et!`)
      return
    }
    addLanguage(lang)
  }

  const handleSelect = (lang) => {
    setActiveLanguage(lang)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800 }}>
          🌍 <span className="gradient-text">Dil Seçimi</span>
        </h1>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>
          Öğrenmek istediğin dili ekle ya da mevcut ilerlemeyi takip et.
        </p>
      </div>

      {/* Active Languages */}
      {user.languages.length > 0 && (
        <>
          <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            📌 Aktif Dillerin ({user.languages.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
            {user.languages.map(lang => (
              <div key={lang.code} className="glass-card"
                style={{
                  padding: '18px 22px',
                  borderColor: 'rgba(124,58,237,0.25)',
                  position: 'relative'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 40 }}>{lang.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{lang.name}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6,
                        background: `${LEVEL_COLORS[lang.level] ?? '#7c3aed'}20`,
                        color: LEVEL_COLORS[lang.level] ?? '#a78bfa',
                        border: `1px solid ${LEVEL_COLORS[lang.level] ?? '#7c3aed'}40`,
                        fontSize: 11, fontWeight: 700
                      }}>{lang.level}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${Math.max(lang.progress, 2)}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 12, color: '#64748b' }}>
                      <span>{lang.wordsLearned.toLocaleString()} kelime öğrenildi</span>
                      <span>{lang.progress}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleSelect(lang)}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <BookOpen size={14} /> Çalış
                    </button>
                    {confirmRemove === lang.code ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { removeLanguage(lang.code); setConfirmRemove(null) }}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                          Evet, Kaldır
                        </button>
                        <button onClick={() => setConfirmRemove(null)}
                          className="btn-ghost" style={{ padding: '8px 10px', fontSize: 12 }}>İptal</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(lang.code)}
                        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Kaldır">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Languages Catalog */}
      <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
        🌐 Tüm Diller — Birini Seç ve Ekle
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}>
        {allLanguages.map(lang => {
          const isActive = activeCodes.includes(lang.code)
          return (
            <div key={lang.code} className="glass-card"
              style={{
                padding: '22px 18px', textAlign: 'center',
                borderColor: isActive ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)',
                position: 'relative', cursor: isActive ? 'default' : 'pointer'
              }}
              onClick={() => !isActive && handleAdd(lang)}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px #10b981'
                }}/>
              )}
              <div style={{ fontSize: 44, marginBottom: 10 }}>{lang.flag}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{lang.name}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{lang.nativeName}</div>

              {isActive ? (
                <div style={{ marginTop: 12, fontSize: 11, color: '#10b981', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  ✓ Öğreniyorsun
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAdd(lang) }}
                  style={{
                    marginTop: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.4)',
                    background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%',
                    transition: 'all 0.2s'
                  }}>
                  <PlusCircle size={13} /> Ekle
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
