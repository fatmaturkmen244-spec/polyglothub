import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Send, RotateCcw, Bot, User } from 'lucide-react'

/* ─── AI Response Engine ─────────────────────────────── */

const AI_PERSONAS = {
  en: {
    name: 'Emma',
    greeting: "Hi! I'm Emma, your English conversation partner. Let's chat! How are you today?",
    responses: [
      (u) => `Great point! In English we often say "${u.split(' ')[0]}" in different contexts. Can you use it in another sentence?`,
      () => "That's wonderful! Your English is improving. Could you tell me more about that?",
      (u) => `Interesting! You mentioned "${u.split(' ').slice(-2).join(' ')}". Let's explore that topic further.`,
      () => "Very good! Let's practice some vocabulary. Can you describe your favorite place?",
      () => "Excellent effort! Remember, practice makes perfect. What do you enjoy doing in your free time?",
      () => "Nice! Try to use more descriptive adjectives. For example, instead of 'good', say 'wonderful' or 'fantastic'.",
      (u) => `I noticed you said "${u.trim().split(' ').slice(0,3).join(' ')}...". Could you expand on that idea?`,
    ],
  },
  es: {
    name: 'María',
    greeting: '¡Hola! Soy María, tu compañera de conversación en español. ¿Cómo estás hoy?',
    responses: [
      () => '¡Muy bien! Tu español está mejorando. ¿Puedes decirme más sobre eso?',
      () => '¡Excelente! Vamos a practicar algunas palabras nuevas. ¿Cuál es tu comida favorita?',
      () => '¡Perfecto! Recuerda usar los artículos correctos: el, la, los, las.',
      () => '¡Bien dicho! ¿Puedes usar esa palabra en otra oración?',
    ],
  },
  fr: {
    name: 'Sophie',
    greeting: 'Bonjour! Je suis Sophie, votre partenaire de conversation en français. Comment allez-vous?',
    responses: [
      () => "Très bien! Votre français s'améliore. Pouvez-vous en dire plus?",
      () => "Excellent! Pratiquons quelques mots nouveaux. Quelle est votre couleur préférée?",
      () => "Parfait! N'oubliez pas les accents en français.",
    ],
  },
  de: {
    name: 'Klaus',
    greeting: 'Guten Tag! Ich bin Klaus, dein Deutsch-Gesprächspartner. Wie geht es dir heute?',
    responses: [
      () => 'Sehr gut! Dein Deutsch verbessert sich. Kannst du mir mehr darüber erzählen?',
      () => 'Ausgezeichnet! Denk daran, dass im Deutschen Substantive groß geschrieben werden.',
    ],
  },
  ja: {
    name: 'Yuki',
    greeting: 'こんにちは！Yukiです。日本語の会話練習をしましょう！今日はどうですか？',
    responses: [
      () => 'とても良い！あなたの日本語は上手ですね。もっと教えてください。',
      () => '面白いですね！日本語で「ありがとう」は感謝を表します。',
    ],
  },
}

const DEFAULT_LNG_CODE = 'en'

const getLangCode = (code) => (AI_PERSONAS[code] ? code : DEFAULT_LNG_CODE)

const TTS_LANGS = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR',
  de: 'de-DE', it: 'it-IT', pt: 'pt-PT',
  ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA'
}

/* ─── Language Selector Bar ──────────────────────────── */
function LangBar({ userLanguages, activeLanguage, setActiveLanguage }) {
  if (!userLanguages?.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
      {userLanguages.map(lang => {
        const isActive = lang.code === activeLanguage?.code
        return (
          <button key={lang.code} onClick={() => setActiveLanguage(lang)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: isActive ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: isActive ? '#a78bfa' : '#64748b', fontWeight: isActive ? 700 : 500,
              fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
            {lang.flag} {lang.name}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Main Chat Component ────────────────────────────── */
export default function Chat({ language, userLanguages, setActiveLanguage, gainXP }) {
  const code = getLangCode(language?.code)
  const persona = AI_PERSONAS[code]
  const [messages, setMessages] = useState([
    { from: 'ai', text: persona.greeting, id: 0 }
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [msgCount, setMsgCount] = useState(0)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  /* Reset conversation when language changes */
  useEffect(() => {
    const newPersona = AI_PERSONAS[getLangCode(language?.code)] ?? AI_PERSONAS.en
    setMessages([{ from: 'ai', text: newPersona.greeting, id: Date.now() }])
    setMsgCount(0)
  }, [language?.code])

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* Text-to-Speech */
  const speak = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = TTS_LANGS[code] ?? 'en-US'
    utt.rate = 0.85
    utt.pitch = 1.1
    utt.onstart = () => setIsSpeaking(true)
    utt.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  /* Speech Recognition */
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Tarayıcınız ses tanımayı desteklemiyor. Chrome kullanmanızı öneririz.'); return }
    const rec = new SR()
    rec.lang = TTS_LANGS[code] ?? 'en-US'
    rec.interimResults = false
    rec.onstart = () => setIsListening(true)
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  /* Send Message */
  const send = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = { from: 'user', text, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    gainXP(5)

    // Pick a random AI response
    setTimeout(() => {
      const replies = persona.responses
      const reply = replies[Math.floor(Math.random() * replies.length)](text)
      const aiMsg = { from: 'ai', text: reply, id: Date.now() + 1 }
      setMessages(prev => [...prev, aiMsg])
      speak(reply)
      setMsgCount(c => c + 1)
    }, 700 + Math.random() * 600)
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const reset = () => {
    window.speechSynthesis?.cancel()
    setMessages([{ from: 'ai', text: persona.greeting, id: Date.now() }])
    setMsgCount(0)
    setInput('')
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: 500 }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={26} color="#a78bfa" />
              <span className="gradient-text">AI Sohbet Partneri</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 3 }}>
              {language?.flag} {persona.name} ile {language?.name ?? 'İngilizce'} pratik yap • +5 XP / mesaj
            </p>
          </div>
          <button onClick={reset} className="btn-ghost" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RotateCcw size={14} /> Yeni Sohbet
          </button>
        </div>

        {/* Language selector */}
        <LangBar userLanguages={userLanguages} activeLanguage={language} setActiveLanguage={setActiveLanguage} />

        {/* Speaking indicator */}
        {isSpeaking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8, fontSize: 13, color: '#a78bfa', marginBottom: 8 }}>
            <Volume2 size={14} className="animate-pulse-glow" />
            {persona.name} konuşuyor…
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4
      }}>
        {messages.map((msg) => {
          const isAI = msg.from === 'ai'
          return (
            <div key={msg.id} style={{
              display: 'flex', alignItems: 'flex-end', gap: 10,
              flexDirection: isAI ? 'row' : 'row-reverse',
              animation: 'fadeInUp 0.3s ease'
            }}>
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: isAI ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isAI ? '0 0 12px rgba(124,58,237,0.4)' : '0 0 12px rgba(6,182,212,0.3)'
              }}>
                {isAI ? <Bot size={16} color="white" /> : <User size={16} color="white" />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                background: isAI ? 'rgba(124,58,237,0.15)' : 'rgba(6,182,212,0.12)',
                border: isAI ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(6,182,212,0.2)',
                fontSize: 14, lineHeight: 1.6
              }}>
                {msg.text}
                {isAI && (
                  <button onClick={() => speak(msg.text)}
                    title="Sesli oku"
                    style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', verticalAlign: 'middle' }}>
                    <Volume2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-end',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, backdropFilter: 'blur(10px)'
      }}>
        {/* Mic button */}
        <button
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Duraksatmak için tıkla' : 'Sesli gir'}
          style={{
            width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: isListening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(124,58,237,0.2)',
            color: isListening ? 'white' : '#a78bfa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.5)' : 'none',
            transition: 'all 0.2s'
          }}>
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isListening ? '🎤 Dinliyorum...' : `${language?.name ?? 'İngilizce'} yaz ya da mikrofona bas...`}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: 14,
            resize: 'none', lineHeight: 1.5, padding: '8px 0',
            height: 'auto', minHeight: 20
          }}
        />
        <button onClick={send} disabled={!input.trim()}
          className="btn-primary"
          style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, opacity: input.trim() ? 1 : 0.4 }}>
          <Send size={15} /> Gönder
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 8 }}>
        Enter ile gönder • Mikrofon ile sesli yaz • Sese tıklayarak dinle
      </div>
    </div>
  )
}
