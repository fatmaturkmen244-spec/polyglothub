import { useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, RotateCcw, Send, User, Volume2, VolumeX } from 'lucide-react'

const TTS_LANGS = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA' }
const GREETINGS = {
  en: { text: 'Hi! How are you today?', translation: 'Merhaba! Bugün nasılsın?' },
  es: { text: '¡Hola! ¿Cómo estás hoy?', translation: 'Merhaba! Bugün nasılsın?' },
  fr: { text: 'Bonjour ! Comment allez-vous aujourd’hui ?', translation: 'Merhaba! Bugün nasılsın?' },
  de: { text: 'Hallo! Wie geht es dir heute?', translation: 'Merhaba! Bugün nasılsın?' },
  it: { text: 'Ciao! Come stai oggi?', translation: 'Merhaba! Bugün nasılsın?' },
  pt: { text: 'Olá! Como está hoje?', translation: 'Merhaba! Bugün nasılsın?' },
  ru: { text: 'Привет! Как ты сегодня?', translation: 'Merhaba! Bugün nasılsın?' },
  ja: { text: 'こんにちは！今日は元気ですか？', translation: 'Merhaba! Bugün nasılsın?' },
  zh: { text: '你好！你今天好吗？', translation: 'Merhaba! Bugün nasılsın?' },
  ar: { text: 'مرحبًا! كيف حالك اليوم؟', translation: 'Merhaba! Bugün nasılsın?' },
}

function LangBar({ userLanguages, activeLanguage, setActiveLanguage }) {
  return <div className="chat-langbar">{userLanguages?.map(lang => <button key={lang.code} className={lang.code === activeLanguage?.code ? 'active' : ''} onClick={() => setActiveLanguage(lang)}>{lang.flag} {lang.name}</button>)}</div>
}

export default function Chat({ language, userLanguages, setActiveLanguage, gainXP }) {
  const greeting = GREETINGS[language?.code] || { text: `Merhaba! ${language?.name} konuşma pratiğine başlayalım.`, translation: '' }
  const initialMessage = () => ({ from: 'ai', text: greeting.text, translation: greeting.translation, correction: '', id: Date.now() })
  const [messages, setMessages] = useState([initialMessage()])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPreparingVoice, setIsPreparingVoice] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [speechRate, setSpeechRate] = useState(0.72)
  const [voiceStyle, setVoiceStyle] = useState('Aoede')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const audioUrlRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])
  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
  }, [])

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    audioRef.current?.pause()
    audioRef.current = null
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = null
    setIsSpeaking(false)
    setIsPreparingVoice(false)
  }

  const browserFallback = text => {
    if (!window.speechSynthesis) throw new Error('Sesli okuma bu tarayıcıda desteklenmiyor.')
    stopSpeaking()
    const utterance = new SpeechSynthesisUtterance(text)
    const locale = TTS_LANGS[language?.code] || 'en-US'
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find(voice => voice.lang.toLowerCase() === locale.toLowerCase())
      || voices.find(voice => voice.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()))
      || null
    utterance.lang = locale
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const speak = async text => {
    if (!text || isPreparingVoice) return
    stopSpeaking()
    setError('')
    setIsPreparingVoice(true)
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: language?.name, pace: speechRate === 0.72 ? 'slow' : 'normal', voice: voiceStyle }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Doğal ses üretilemedi.')
      const bytes = Uint8Array.from(atob(data.audioBase64), character => character.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: data.mimeType || 'audio/wav' }))
      const audio = new Audio(url)
      audioRef.current = audio
      audioUrlRef.current = url
      audio.onplay = () => { setIsPreparingVoice(false); setIsSpeaking(true) }
      audio.onended = stopSpeaking
      audio.onerror = () => { stopSpeaking(); setError('Oluşturulan ses oynatılamadı.') }
      await audio.play()
    } catch (requestError) {
      setIsPreparingVoice(false)
      try {
        browserFallback(text)
        setError('Doğal ses geçici olarak kullanılamadı; cihaz sesiyle okundu.')
      } catch {
        setError(requestError.message)
      }
    }
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setError('Ses tanıma bu tarayıcıda desteklenmiyor. Chrome kullanabilirsiniz.')
    stopSpeaking()
    const recognition = new SpeechRecognition()
    recognition.lang = TTS_LANGS[language?.code] || 'en-US'
    recognition.interimResults = false
    recognition.onstart = () => { setIsListening(true); setError('') }
    recognition.onresult = event => setInput(event.results[0][0].transcript)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => { setIsListening(false); setError('Sesiniz anlaşılamadı. Mikrofona biraz daha yakın ve yavaş konuşmayı deneyin.') }
    recognitionRef.current = recognition
    recognition.start()
  }

  const send = async () => {
    const text = input.trim()
    if (!text || isThinking) return
    const userMessage = { from: 'user', text, id: Date.now() }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsThinking(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: language.name, level: language.level, messages: nextMessages }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Bot yanıt veremedi.')
      const aiMessage = { from: 'ai', text: data.reply, translation: data.translation, correction: data.correction, id: Date.now() + 1 }
      setMessages(current => [...current, aiMessage])
      gainXP(5)
      speak(data.reply)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsThinking(false)
    }
  }

  const reset = () => {
    stopSpeaking()
    setMessages([initialMessage()])
    setInput('')
    setError('')
  }

  return <section className="voice-chat animate-fade-in">
    <header className="voice-header"><div><span className="studio-kicker"><Bot size={14} /> GEMINI KONUŞMA KOÇU</span><h1>{language?.flag} {language?.name} sesli pratik</h1><p>{language?.level} seviyene uygun kısa yanıtlar, Türkçe anlam ve anlaşılır seslendirme.</p></div><button onClick={reset} className="btn-ghost"><RotateCcw size={15} /> Yeni sohbet</button></header>
    <LangBar userLanguages={userLanguages} activeLanguage={language} setActiveLanguage={setActiveLanguage} />
    <div className="speech-controls"><span>Konuşma hızı</span><button className={speechRate === 0.72 ? 'active' : ''} onClick={() => setSpeechRate(0.72)}>Yavaş</button><button className={speechRate === 0.9 ? 'active' : ''} onClick={() => setSpeechRate(0.9)}>Normal</button><label>Koçun sesi<select value={voiceStyle} onChange={event => setVoiceStyle(event.target.value)}><option value="Aoede">Yumuşak</option><option value="Kore">Net</option></select></label></div>
    {isPreparingVoice && <div className="voice-status"><Volume2 size={15} /> Doğal ses hazırlanıyor…</div>}
    {isSpeaking && <div className="voice-status"><Volume2 size={15} /> Koç yalnızca yabancı dildeki yanıtı okuyor.<button onClick={stopSpeaking}><VolumeX size={14} /> Durdur</button></div>}
    {error && <p className="studio-error voice-error">{error}</p>}
    <div className="message-stream">{messages.map(message => <div key={message.id} className={`message-row ${message.from}`}><div className="message-avatar">{message.from === 'ai' ? <Bot size={17} /> : <User size={17} />}</div><div className="message-bubble"><div>{message.text}</div>{message.from === 'ai' && message.translation && <div className="message-translation"><strong>Türkçesi:</strong> {message.translation}</div>}{message.from === 'ai' && message.correction && <div className="message-correction"><strong>Küçük düzeltme:</strong> {message.correction}</div>}{message.from === 'ai' && <button onClick={() => speak(message.text)} aria-label="Yabancı dildeki yanıtı sesli oku"><Volume2 size={14} /></button>}</div></div>)}{isThinking && <div className="message-row ai"><div className="message-avatar"><Bot size={17} /></div><div className="message-bubble thinking">Kısa bir yanıt hazırlanıyor…</div></div>}<div ref={bottomRef} /></div>
    <div className="voice-composer"><button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={() => isListening ? recognitionRef.current?.stop() : startListening()} aria-label={isListening ? 'Dinlemeyi durdur' : 'Mikrofonu aç'}>{isListening ? <MicOff size={19} /> : <Mic size={19} />}</button><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder={isListening ? 'Dinliyorum…' : 'Yaz veya mikrofona bas…'} rows={1} /><button className="btn-primary send-button" onClick={send} disabled={!input.trim() || isThinking}><Send size={16} /> Gönder</button></div>
    <small className="voice-note">Koç kısa konuşur · Türkçe anlamı yazıyla gösterir · Ses düğmesi yalnızca hedef dili okur</small>
  </section>
}
