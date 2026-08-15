import { generateWithGemini } from './_gemini.js'

const schema = {
  type: 'OBJECT',
  required: ['cards'],
  properties: {
    cards: {
      type: 'ARRAY', minItems: 8, maxItems: 8,
      items: {
        type: 'OBJECT', required: ['word', 'meaning', 'example', 'exampleMeaning'],
        properties: { word: { type: 'STRING' }, meaning: { type: 'STRING' }, example: { type: 'STRING' }, exampleMeaning: { type: 'STRING' } },
      },
    },
  },
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  const { language, level, exclude = [] } = request.body || {}
  if (!language || !level) return response.status(400).json({ error: 'Dil veya seviye eksik.' })
  const excluded = Array.isArray(exclude) ? exclude.slice(-40).join(', ') : ''
  try {
    const output = await generateWithGemini({
      parts: [{ text: `Türkçe konuşan bir öğrenci için ${language} dilinde CEFR ${level} seviyesine uygun 8 farklı tekrar kartı hazırla. Günlük hayatta yararlı, doğal ve birbirinden farklı kelimeler seç. Daha önce gösterilen şu kelimeleri kesinlikle tekrar etme: ${excluded || 'yok'}. Her karta kısa Türkçe anlam, doğal örnek cümle ve örneğin Türkçe anlamını ekle.` }],
      responseSchema: schema,
    })
    return response.status(200).json(JSON.parse(output))
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}
