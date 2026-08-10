import { useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, RotateCcw, Send, User, Volume2 } from 'lucide-react'

const TTS_LANGS = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA' }
const GREETINGS = {
  en: 'Hi! I am your English conversation coach. How are you today?',
  es: '¡Hola! Soy tu compañero de conversación. ¿Cómo estás hoy?',
  fr: 'Bonjour ! Je suis votre partenaire de conversation. Comment allez-vous ?',
  de: 'Hallo! Ich bin dein Gesprächspartner. Wie geht es dir heute?',
  ja: 'こんにちは！会話の練習をしましょう。今日はどうですか？',
}

function LangBar({ userLanguages, activeLanguage, setActiveLanguage }) {
  return <div className="chat-langbar">{userLanguages?.map(lang => <button key={lang.code} className={lang.code === activeLanguage?.code ? 'active' : ''} onClick={() => setActiveLanguage(lang)}>{lang.flag} {lang.name}</button>)}</div>
}

export default function Chat({ language, userLanguages, setActiveLanguage, gainXP }) {
  const greeting = GREETINGS[language?.code] || `Merhaba! ${language?.name} konuşma pratiğine başlayalım.`
  const [messages, setMessages] = useState([{ from: 'ai', text: greeting, id: 0 }])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])

  const speak = text => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = TTS_LANGS[language?.code] || 'en-US'; utterance.rate = .88
    utterance.onstart = () => setIsSpeaking(true); utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setError('Ses tanıma bu tarayıcıda desteklenmiyor. Chrome kullanabilirsiniz.')
    const recognition = new SpeechRecognition()
    recognition.lang = TTS_LANGS[language?.code] || 'en-US'; recognition.interimResults = false
    recognition.onstart = () => { setIsListening(true); setError('') }
    recognition.onresult = event => setInput(event.results[0][0].transcript)
    recognition.onend = () => setIsListening(false); recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition; recognition.start()
  }

  const send = async () => {
    const text = input.trim(); if (!text || isThinking) return
    const userMessage = { from: 'user', text, id: Date.now() }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages); setInput(''); setError(''); setIsThinking(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: language.name, level: language.level, messages: nextMessages }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Bot yanıt veremedi.')
      const aiMessage = { from: 'ai', text: data.reply, id: Date.now() + 1 }
      setMessages(current => [...current, aiMessage]); gainXP(5); speak(data.reply)
    } catch (requestError) { setError(requestError.message) } finally { setIsThinking(false) }
  }

  const reset = () => { window.speechSynthesis?.cancel(); setMessages([{ from: 'ai', text: greeting, id: Date.now() }]); setInput(''); setError('') }

  return <section className="voice-chat animate-fade-in">
    <header className="voice-header"><div><span className="studio-kicker"><Bot size={14} /> GEMINI KONUŞMA KOÇU</span><h1>{language?.flag} {language?.name} sesli pratik</h1><p>{language?.level} seviyene uygun konuş; bot hatalarını nazikçe düzeltsin ve sesli yanıt versin.</p></div><button onClick={reset} className="btn-ghost"><RotateCcw size={15} /> Yeni sohbet</button></header>
    <LangBar userLanguages={userLanguages} activeLanguage={language} setActiveLanguage={setActiveLanguage} />
    {isSpeaking && <div className="voice-status"><Volume2 size={15} /> Bot konuşuyor…</div>}
    {error && <p className="studio-error voice-error">{error}</p>}
    <div className="message-stream">{messages.map(message => <div key={message.id} className={`message-row ${message.from}`}><div className="message-avatar">{message.from === 'ai' ? <Bot size={17} /> : <User size={17} />}</div><div className="message-bubble">{message.text}{message.from === 'ai' && <button onClick={() => speak(message.text)} aria-label="Yanıtı sesli oku"><Volume2 size={14} /></button>}</div></div>)}{isThinking && <div className="message-row ai"><div className="message-avatar"><Bot size={17} /></div><div className="message-bubble thinking">Yanıt hazırlanıyor<span>…</span></div></div>}<div ref={bottomRef} /></div>
    <div className="voice-composer"><button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={() => isListening ? recognitionRef.current?.stop() : startListening()}>{isListening ? <MicOff size={19} /> : <Mic size={19} />}</button><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder={isListening ? 'Dinliyorum…' : 'Yaz veya mikrofona bas…'} rows={1} /><button className="btn-primary send-button" onClick={send} disabled={!input.trim() || isThinking}><Send size={16} /> Gönder</button></div>
    <small className="voice-note">Mikrofonla konuş · Gemini yanıt versin · Yanıt otomatik seslendirilsin</small>
  </section>
}
