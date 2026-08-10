/* global process */
export const generateWithGemini = async ({ parts, responseSchema }) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini servisi henüz yapılandırılmadı. GEMINI_API_KEY eklenmeli.')
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const generationConfig = responseSchema ? { responseMimeType: 'application/json', responseSchema } : undefined
  const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig }),
  })
  const data = await apiResponse.json()
  if (!apiResponse.ok) throw new Error(data.error?.message || 'Gemini isteği başarısız oldu.')
  const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim()
  if (!text) throw new Error('Gemini boş bir yanıt döndürdü.')
  return text
}
