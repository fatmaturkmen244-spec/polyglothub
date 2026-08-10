import { generateWithGemini } from './_gemini.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  const { language, level, messages } = request.body || {}
  if (!language || !Array.isArray(messages) || !messages.length) return response.status(400).json({ error: 'Sohbet bilgileri eksik.' })
  const recentHistory = messages.slice(-10).map(message => `${message.from === 'user' ? 'Öğrenci' : 'Öğretmen'}: ${message.text}`).join('\n')
  try {
    const reply = await generateWithGemini({ parts: [{ text: `Sen Türkçe bilen, sıcak ve sabırlı bir ${language} konuşma öğretmenisin. Öğrencinin seviyesi ${level}. Öncelikle ${language} dilinde kısa ve doğal cevap ver. Öğrencinin önemli bir hatası varsa cümlenin sonunda Türkçe, kırmadan tek cümleyle düzelt. Seviyesinin çok üzerinde kelimeler kullanma. Sohbeti açık bir soruyla sürdür.\n\nSohbet:\n${recentHistory}` }] })
    return response.status(200).json({ reply })
  } catch (error) { return response.status(500).json({ error: error.message }) }
}
