const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function routeIntent(intent, entities, userId, studentName, language = 'id') {
    const Activity = require('../models/Activity');
    const User = require('../models/User');
    const DailyQuest = require('../models/DailyQuest');

    const lang = language || 'id';

    switch (intent) {
        case 'show_hafalan_stats':
            return await getHafalanStats(Activity, studentName, lang);

        case 'show_leaderboard':
            return await getLeaderboard(Activity, studentName, entities, lang);

        case 'start_chat':
            return await startChat(studentName, entities, lang);

        case 'send_message':
            return await sendMessage(studentName, entities, lang);

        case 'update_profile':
            return await updateProfile(User, userId, entities, lang);

        case 'show_missions':
            return await getMissions(DailyQuest, studentName, lang);

        case 'show_weather':
            return await getWeather(entities, lang);

        case 'show_traffic':
            return await getTraffic(entities, lang);

        case 'read_materi':
            return await readMateri(entities, lang);

        case 'start_hafalan':
            return await startHafalan(entities, lang);

        case 'start_quiz':
            return await startQuiz(entities, lang);

        case 'toggle_language':
            return await toggleLanguage(lang);

        case 'show_profile':
            return await showProfile(User, studentName, lang);

        case 'general_question':
        default:
            return await askGemini(entities?.question || entities?.text || '', studentName, lang);
    }
}

async function getHafalanStats(Activity, studentName, lang) {
    try {
        const hafalanActivities = await Activity.find({
            student_name: studentName,
            activity_type: 'hafalan'
        }).sort({ timestamp: -1 }).limit(20);

        if (hafalanActivities.length === 0) {
            return {
                text: lang === 'id'
                    ? 'Kamu belum ada riwayat hafalan. Ayo mulai setoran pertamamu!'
                    : 'You have no hafalan history yet. Let\'s start your first review!',
                intent: 'show_hafalan_stats',
                data: { count: 0, average: 0 }
            };
        }

        const totalScore = hafalanActivities.reduce((sum, a) => sum + (a.hafalan_features?.score || 0), 0);
        const average = Math.round(totalScore / hafalanActivities.length);
        const count = hafalanActivities.length;
        const lastScore = hafalanActivities[0]?.hafalan_features?.score || 0;

        const text = lang === 'id'
            ? `Rerata hafalanmu ${average}% dari ${count} kali setoran. Skor terakhir: ${lastScore}%. ${average >= 70 ? 'Pertahankan!' : 'Terus berlatih!'}`
            : `Your hafalan average is ${average}% from ${count} reviews. Last score: ${lastScore}%. ${average >= 70 ? 'Keep it up!' : 'Keep practicing!'}`;

        return {
            text,
            intent: 'show_hafalan_stats',
            data: { count, average, lastScore }
        };
    } catch (e) {
        return { text: 'Gagal mengambil data hafalan.', intent: 'error', data: {} };
    }
}

async function getLeaderboard(Activity, studentName, entities, lang) {
    const period = entities?.time_period || 'weekly';
    return {
        text: lang === 'id'
            ? `Leaderboard ${period}: Kamu masih di peringkat pertama dengan 0 XP. Ayo belajar lebih giat!`
            : `${period} leaderboard: You're still in first place with 0 XP. Let's study harder!`,
        intent: 'show_leaderboard',
        data: { period, rank: 1, xp: 0 }
    };
}

async function startChat(studentName, entities, lang) {
    const friendName = entities?.friend_name || 'teman';
    return {
        text: lang === 'id'
            ? `Membuka chat dengan ${friendName}. Tekan tombol dan bicara untuk mengirim pesan.`
            : `Opening chat with ${friendName}. Press button and talk to send a message.`,
        intent: 'start_chat',
        data: { friend_name: friendName, mode: 'chat' }
    };
}

async function sendMessage(studentName, entities, lang) {
    const message = entities?.message || '';
    return {
        text: lang === 'id'
            ? `Pesan terkirim: "${message}"`
            : `Message sent: "${message}"`,
        intent: 'send_message',
        data: { message, sent: true }
    };
}

async function updateProfile(User, userId, entities, lang) {
    const field = entities?.field || 'bio';
    const value = entities?.value || '';
    return {
        text: lang === 'id'
            ? `Profil ${field} diubah menjadi "${value}"`
            : `Profile ${field} changed to "${value}"`,
        intent: 'update_profile',
        data: { field, value }
    };
}

async function getMissions(DailyQuest, studentName, lang) {
    return {
        text: lang === 'id'
            ? 'Misi mingguan: Baca 5 halaman, Hafalan 5x, Kuis 3x. Semua belum selesai. Ayo mulai!'
            : 'Weekly missions: Read 5 pages, Hafalan 5x, Quiz 3x. None completed yet. Let\'s start!',
        intent: 'show_missions',
        data: { missions: [] }
    };
}

async function getWeather(entities, lang) {
    const location = entities?.location || 'Jakarta';
    return {
        text: lang === 'id'
            ? `Cuaca di ${location}: Cerah, 32°C. Cocok untuk belajar!`
            : `Weather in ${location}: Sunny, 32°C. Perfect for studying!`,
        intent: 'show_weather',
        data: { location, temp: 32, condition: 'sunny' }
    };
}

async function getTraffic(entities, lang) {
    const location = entities?.location || 'Soekarno Hatta';
    return {
        text: lang === 'id'
            ? `Kondisi jalan ${location}: Lancar, tidak ada kemacetan.`
            : `Traffic on ${location}: Smooth, no congestion.`,
        intent: 'show_traffic',
        data: { location, condition: 'smooth' }
    };
}

async function readMateri(entities, lang) {
    const page = entities?.page || 1;
    return {
        text: lang === 'id'
            ? `Membuka halaman ${page}. Selamat membaca!`
            : `Opening page ${page}. Happy reading!`,
        intent: 'read_materi',
        data: { page }
    };
}

async function startHafalan(entities, lang) {
    const page = entities?.page || 1;
    return {
        text: lang === 'id'
            ? `Mode hafalan halaman ${page}. Tekan tombol dan mulai setoran!`
            : `Hafalan mode page ${page}. Press button and start your review!`,
        intent: 'start_hafalan',
        data: { page }
    };
}

async function startQuiz(entities, lang) {
    const page = entities?.page || 1;
    return {
        text: lang === 'id'
            ? `Mode kuis halaman ${page}. Buka dashboard untuk menjawab!`
            : `Quiz mode page ${page}. Open dashboard to answer!`,
        intent: 'start_quiz',
        data: { page }
    };
}

async function toggleLanguage(lang) {
    const newLang = lang === 'id' ? 'en' : 'id';
    return {
        text: newLang === 'id' ? 'Bahasa diganti ke Indonesia' : 'Language changed to English',
        intent: 'toggle_language',
        data: { language: newLang }
    };
}

async function showProfile(User, studentName, lang) {
    try {
        const user = await User.findOne({ nama: studentName });
        if (!user) {
            return {
                text: lang === 'id' ? 'Profil tidak ditemukan.' : 'Profile not found.',
                intent: 'show_profile',
                data: {}
            };
        }
        return {
            text: lang === 'id'
                ? `Profil: ${user.nama}, Level: Pemula, Bio: ${user.bio || 'belum diisi'}`
                : `Profile: ${user.nama}, Level: Pemula, Bio: ${user.bio || 'not set'}`,
            intent: 'show_profile',
            data: { nama: user.nama, bio: user.bio, title: user.title }
        };
    } catch (e) {
        return { text: 'Gagal mengambil profil.', intent: 'error', data: {} };
    }
}

async function askGemini(studentName, entities, lang) {
    if (!ai) {
        return {
            text: lang === 'id'
                ? 'AI tidak tersedia. Silakan coba lagi nanti.'
                : 'AI not available. Please try again later.',
            intent: 'general_question',
            data: {}
        };
    }

    const question = entities?.question || entities?.text || '';
    const prompt = lang === 'id'
        ? `Kamu adalah EduBook, asisten belajar AI. Jawab pertanyaan ini dengan singkat dan ramah (maksimal 2 kalimat): "${question}"`
        : `You are EduBook, an AI learning assistant. Answer this question briefly and friendly (max 2 sentences): "${question}"`;

    try {
        const result = await Promise.race([
            ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000))
        ]);
        return {
            text: result.text ? result.text.trim() : 'Maaf, saya tidak mengerti.',
            intent: 'general_question',
            data: {}
        };
    } catch (e) {
        return {
            text: lang === 'id' ? 'Maaf, saya tidak bisa menjawab saat ini.' : 'Sorry, I cannot answer right now.',
            intent: 'general_question',
            data: {}
        };
    }
}

module.exports = { routeIntent };
