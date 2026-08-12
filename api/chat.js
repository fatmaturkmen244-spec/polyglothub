import { generateWithGemini } from './_gemini.js'

const responseSchema = {
  type: 'OBJECT',
  required: ['reply', 'translation', 'correction'],
  properties: {
    reply: { type: 'STRING' },
    translation: { type: 'STRING' },
    correction: { type: 'STRING' },
  },
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  const { language, level, messages } = request.body || {}
  if (!language || !Array.isArray(messages) || !messages.length) return response.status(400).json({ error: 'Sohbet bilgileri eksik.' })
  const recentHistory = messages.slice(-10).map(message => `${message.from === 'user' ? 'Öğrenci' : 'Öğretmen'}: ${message.text}`).join('\n')
  try {
    const output = await generateWithGemini({
      parts: [{ text: `Sen Türkçe bilen, sıcak ve sabırlı bir ${language} konuşma öğretmenisin. Öğrencinin seviyesi CEFR ${level}.

Yanıt kuralları:
- reply: Yalnızca ${language} dilinde, seviyeye uygun, en fazla iki kısa ve doğal cümle yaz. Sade ve günlük kelimeler kullan. Markdown, parantez veya Türkçe açıklama ekleme. Sonunda kolay bir soru sor.
- translation: reply alanının doğal ve eksiksiz Türkçe anlamını yaz.
- correction: Öğrencinin önemli bir dil bilgisi veya kelime hatası varsa Türkçe ve tek kısa cümleyle açıkla. Hata yoksa boş metin yaz.
- Telaffuzu zorlaştıracak gereksiz uzun cümleler kurma.

Sohbet:
${recentHistory}` }],
      responseSchema,
    })
    return response.status(200).json(JSON.parse(output))
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}
