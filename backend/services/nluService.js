const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function understandIntent(text, userContext = {}, language = 'id') {
    if (!ai) {
        console.warn('[NLU] AI not configured, using fallback');
        return fallbackIntentDetection(text);
    }

    const langPrompt = language === 'id'
        ? `Analisis perintah pengguna ini dan kembalikan JSON dengan intent dan entities.`
        : `Analyze this user command and return JSON with intent and entities.`;

    const prompt = `${langPrompt}

User said: "${text}"
User context: ${JSON.stringify(userContext)}

Available intents:
- show_hafalan_stats: "rerata hafalan", "nilai hafalan", "statistik hafalan", "hafalan saya", "my hafalan", "hafalan saya"
- show_leaderboard: "leaderboard", "peringkat", "ranking", "leaderboard mingguan", "leaderboard total"
- start_chat: "chat teman", "bicara dengan", "kirim pesan", "chat dengan", "chat with"
- send_message: "kirim", "oke kirim", "send", "kirim bro", "send it"
- update_profile: "ubah bio", "ganti profil", "update profile", "ubah nama", "change bio"
- show_missions: "misi", "quest", "tugas harian", "misi mingguan", "weekly missions"
- show_weather: "cuaca", "weather", "cuaca hari ini", "how's the weather"
- show_traffic: "macet", "lalu lintas", "jalan", "kondisi jalan", "traffic"
- read_materi: "baca materi", "baca halaman", "baca buku", "read book"
- start_hafalan: "hafalan", "setoran", "review lisan", "smart review"
- start_quiz: "kuis", "quiz", "tantangan", "challenge"
- toggle_language: "bahasa indonesia", "english", "ganti bahasa", "change language"
- show_profile: "profil", "profile", "profil saya", "my profile"
- general_question: any other question

Return JSON only, no markdown, no explanation: { "intent": "...", "entities": { ... }, "confidence": 0.0-1.0 }`;

    try {
        const result = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('NLU_TIMEOUT')), 20000))
        ]);

        let cleanText = result.text.trim();
        if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(cleanText);
        console.log(`[NLU] Intent: ${parsed.intent}, confidence: ${parsed.confidence}`);
        return parsed;
    } catch (error) {
        console.error('[NLU] Intent detection error:', error.message);
        return fallbackIntentDetection(text);
    }
}

function fallbackIntentDetection(text) {
    const textLower = text.toLowerCase().trim();

    if (textLower.includes('hafalan') || textLower.includes('rerata') || textLower.includes('nilai')) {
        return { intent: 'show_hafalan_stats', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('leaderboard') || textLower.includes('peringkat') || textLower.includes('ranking')) {
        return { intent: 'show_leaderboard', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('chat') || textLower.includes('teman') || textLower.includes('bicara')) {
        return { intent: 'start_chat', entities: {}, confidence: 0.6 };
    }
    if (textLower.includes('misi') || textLower.includes('quest') || textLower.includes('tugas')) {
        return { intent: 'show_missions', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('cuaca') || textLower.includes('weather')) {
        return { intent: 'show_weather', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('macet') || textLower.includes('lalu lintas') || textLower.includes('jalan')) {
        return { intent: 'show_traffic', entities: {}, confidence: 0.6 };
    }
    if (textLower.includes('baca') || textLower.includes('materi') || textLower.includes('buku')) {
        return { intent: 'read_materi', entities: {}, confidence: 0.6 };
    }
    if (textLower.includes('kuis') || textLower.includes('quiz') || textLower.includes('tantangan')) {
        return { intent: 'start_quiz', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('bahasa') || textLower.includes('language') || textLower.includes('english')) {
        return { intent: 'toggle_language', entities: {}, confidence: 0.7 };
    }
    if (textLower.includes('profil') || textLower.includes('profile') || textLower.includes('bio')) {
        return { intent: 'show_profile', entities: {}, confidence: 0.6 };
    }

    return { intent: 'general_question', entities: {}, confidence: 0.3 };
}

module.exports = { understandIntent, fallbackIntentDetection };
