import { generateWithGemini } from './_gemini.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  const { language, level, count, topic } = request.body || {}
  if (!language || !level || ![20, 25, 30].includes(Number(count))) return response.status(400).json({ error: 'Dil, seviye veya set büyüklüğü geçersiz.' })
  const itemSchema = { type: 'OBJECT', required: ['type', 'term', 'meaning', 'example', 'exampleMeaning', 'note'], properties: { type: { type: 'STRING', enum: ['word', 'phrase'] }, term: { type: 'STRING' }, meaning: { type: 'STRING' }, example: { type: 'STRING' }, exampleMeaning: { type: 'STRING' }, note: { type: 'STRING' } } }
  const schema = { type: 'OBJECT', required: ['title', 'studyTip', 'items'], properties: { title: { type: 'STRING' }, studyTip: { type: 'STRING' }, items: { type: 'ARRAY', minItems: Number(count), maxItems: Number(count), items: itemSchema } } }
  try {
    const output = await generateWithGemini({ parts: [{ text: `Türkçe konuşan bir öğrenci için ${language} dilinde, CEFR ${level} seviyesine uygun, ${topic} konulu tam ${count} öğelik ezber seti oluştur. Yaklaşık yarısı günlük kelime, yarısı doğal konuşma kalıbı olsun. Tekrar etme. Her öğeye kısa Türkçe anlam, doğal örnek cümle, örneğin Türkçe anlamı ve kısa kullanım notu ver.` }], responseSchema: schema })
    return response.status(200).json(JSON.parse(output))
  } catch (error) { return response.status(500).json({ error: error.message }) }
}
