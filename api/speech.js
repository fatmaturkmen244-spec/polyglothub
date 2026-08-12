/* global Buffer, process */

const makeWav = pcm => {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(24000, 24)
  header.writeUInt32LE(48000, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

const generateSpeech = async ({ text, language, pace, voice }) => {
  const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview'
  const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate speech. Read only the transcript below, exactly once, in ${language} with a natural native accent. Use a warm, human tone and a ${pace === 'slow' ? 'slow, very clear language-learning' : 'comfortable, clear conversational'} pace. Do not read these instructions and do not add any words.\n\nTRANSCRIPT:\n${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  })
  const data = await apiResponse.json()
  if (!apiResponse.ok) throw new Error(data.error?.message || 'Doğal ses üretilemedi.')
  const audio = data.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data)?.inlineData?.data
  if (!audio) throw new Error('Ses servisi boş yanıt döndürdü.')
  return makeWav(Buffer.from(audio, 'base64')).toString('base64')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Yalnızca POST isteği desteklenir.' })
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'Ses servisi henüz yapılandırılmadı.' })
  const { text, language, pace = 'slow', voice = 'Aoede' } = request.body || {}
  if (!text?.trim() || !language) return response.status(400).json({ error: 'Seslendirilecek metin veya dil eksik.' })
  if (text.length > 1000) return response.status(400).json({ error: 'Seslendirilecek metin çok uzun.' })
  if (!['Aoede', 'Kore'].includes(voice)) return response.status(400).json({ error: 'Geçersiz ses seçimi.' })
  try {
    const audioBase64 = await generateSpeech({ text: text.trim(), language, pace, voice })
    response.setHeader('Cache-Control', 'private, max-age=3600')
    return response.status(200).json({ audioBase64, mimeType: 'audio/wav' })
  } catch (error) {
    return response.status(500).json({ error: error.message })
  }
}
