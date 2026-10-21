const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function transcribeAudio(audioBase64, language = 'id') {
    if (!ai) {
        console.warn('[STT] AI not configured, returning empty transcription');
        return '';
    }

    const langPrompt = language === 'id'
        ? 'Transcribe this audio to Indonesian text. Return only the transcribed text, no explanations, no punctuation at the end.'
        : 'Transcribe this audio to English text. Return only the transcribed text, no explanations, no punctuation at the end.';

    try {
        const result = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { text: langPrompt },
                    { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }
                ]
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('STT_TIMEOUT')), 30000))
        ]);

        const text = result.text ? result.text.trim() : '';
        console.log(`[STT] Transcribed (${language}): "${text}"`);
        return text;
    } catch (error) {
        console.error('[STT] Transcription error:', error.message);
        return '';
    }
}

module.exports = { transcribeAudio };
