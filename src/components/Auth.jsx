import { useState } from 'react'
import { BookOpen, LogIn, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = mode === 'register'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() || 'Öğrenci' } },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error.message })
      return
    }

    if (mode === 'register' && !result.data.session) {
      setMessage({ type: 'success', text: 'Hesabınız oluşturuldu. E-postanıza gelen doğrulama bağlantısını açın.' })
    }
  }

  const switchMode = () => {
    setMode(current => current === 'login' ? 'register' : 'login')
    setMessage(null)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <section className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 430, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
            <BookOpen size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 27, fontWeight: 800 }} className="gradient-text">PolyglotHub</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
            {mode === 'login' ? 'Öğrenmeye devam etmek için giriş yapın.' : 'Ücretsiz hesabınızı oluşturun.'}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#cbd5e1' }}>
              Adınız
              <input required value={displayName} onChange={event => setDisplayName(event.target.value)} autoComplete="name"
                style={inputStyle} placeholder="Adınız" />
            </label>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#cbd5e1' }}>
            E-posta
            <input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email"
              style={inputStyle} placeholder="ornek@email.com" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#cbd5e1' }}>
            Şifre
            <input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={inputStyle} placeholder="En az 6 karakter" />
          </label>

          {message && (
            <div role="status" style={{ padding: '10px 12px', borderRadius: 9, fontSize: 13,
              color: message.type === 'error' ? '#fca5a5' : '#6ee7b7',
              background: message.type === 'error' ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)' }}>
              {message.text}
            </div>
          )}

          <button className="btn-primary" disabled={loading} style={{ padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}
            {loading ? 'Lütfen bekleyin…' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>

        <button type="button" onClick={switchMode} className="btn-ghost" style={{ width: '100%', marginTop: 14, fontSize: 13 }}>
          {mode === 'login' ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
        </button>
      </section>
    </main>
  )
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9,
  border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.05)',
  color: '#f8fafc', font: 'inherit', outline: 'none',
}
