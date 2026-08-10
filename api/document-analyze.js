import { generateWithGemini } from './_gemini.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  const { fileBase64, fileName, mode, targetLanguage } = request.body || {}
  if (!fileBase64 || !fileName) return response.status(400).json({ error: 'PDF dosyası eksik.' })
  const task = mode === 'translate'
    ? `Bu PDF belgesinin dilini algıla ve içeriğini ${targetLanguage} diline çevir. Anlamı, tonu, özel adları, başlıkları ve paragraf sırasını koru. Açıklama ekleme.`
    : 'Bu PDF belgesinin dilini algıla. Türkçe olarak kısa özet, ana fikirler, önemli kavramlar ve öğrenme notları içeren kapsamlı fakat öz bir analiz üret.'
  try {
    const output = await generateWithGemini({ parts: [
      { inline_data: { mime_type: 'application/pdf', data: fileBase64 } },
      { text: `${task}\nYanıtının ilk satırı tam olarak "ALGILANAN_DIL: <dil>" biçiminde olsun.` },
    ] })
    const [firstLine, ...rest] = output.split('\n')
    return response.status(200).json({ detectedLanguage: firstLine.replace(/^ALGILANAN_DIL:\s*/i, '').trim() || 'Algılanamadı', content: rest.join('\n').trim() })
  } catch (error) { return response.status(500).json({ error: error.message }) }
}
