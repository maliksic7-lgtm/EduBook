// aiService.js
// Konsolidasi semua interaksi dengan Google Gemini API yang sebelumnya
// tersebar di berbagai endpoint server.js.
//
// PERBAIKAN KEAMANAN PENTING dibanding versi sebelumnya:
// - Tidak ada lagi API key yang di-hardcode sebagai fallback di kode.
//   Sebelumnya ada `process.env.GEMINI_API_KEY || "AQ.Ab8..."` — kalau kode
//   ini di-push ke repo publik (kemungkinan besar terjadi untuk submission
//   SIC), key tersebut akan bocor ke publik. Sekarang WAJIB diisi lewat
//   file .env (lihat .env.example).

const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY tidak ditemukan di environment variables.');
    console.warn('⚠️  Fitur AI akan otomatis pakai fallback knowledge base (lihat fallbackService.js).');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const PRIMARY_MODEL = 'gemini-2.5-flash';
const RETRY_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

// ---------------------------------------------------------------
// Evaluasi Hafalan (Smart-Review Lisan)
// ---------------------------------------------------------------

async function evaluasiHafalanDenganAI(teksBukuAsli, teksHafalanSiswa) {
    if (!ai) throw new Error('AI_NOT_CONFIGURED');

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_GEMINI')), 30000)
    );

    const aiPromise = (async () => {
        const prompt = `
        Anda adalah asisten guru pintar untuk proyek EduBook (Smart Learning Book - SIC Batch 8).
        Tugas Anda adalah mengevaluasi tingkat akurasi setoran hafalan siswa berdasarkan materi paragraf asli yang dipilih.

        Materi Paragraf Asli Buku: "${teksBukuAsli || 'Teks buku tidak tersedia'}"
        Setoran Hafalan Lisan Siswa: "${teksHafalanSiswa}"

        Berikan penilaian yang objektif. Skala skor adalah 0 sampai 100.
        Berikan umpan balik (feedback) singkat yang memotivasi dalam bahasa Indonesia.
        Gunakan bahasa yang ramah dan santun: panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu").

        Keluarkan output dalam format JSON murni seperti ini:
        {
            "score": 85,
            "feedback_text": "Hafalan sudah bagus, namun ada bagian kecil yang terlewat..."
        }
        `;

        const response = await ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt });

        let cleanText = response.text.trim();
        if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
        }
        return JSON.parse(cleanText);
    })();

    return Promise.race([aiPromise, timeoutPromise]);
}

function estimasiSkorFallback(teksBukuAsli, teksHafalanSiswa) {
    const panjangHafalan = teksHafalanSiswa.length;
    const panjangBuku = (teksBukuAsli || '').length;
    let estimatedScore = 70;

    if (panjangBuku > 0) {
        const ratio = Math.min(panjangHafalan / panjangBuku, 1);
        estimatedScore = Math.round(50 + (ratio * 50));
    }

    return {
        score: Math.min(estimatedScore, 85),
        feedback_text: `Hafalanmu terdeteksi ${estimatedScore >= 70 ? 'sangat baik' : 'cukup baik'} oleh sistem EduBook! ${estimatedScore >= 70 ? 'Pertahankan prestasimu!' : 'Terus berlatih dan tingkatkan lagi!'}`
    };
}

async function evaluateHafalan(teksBukuAsli, teksHafalanSiswa) {
    try {
        return await evaluasiHafalanDenganAI(teksBukuAsli, teksHafalanSiswa);
    } catch (error) {
        console.error("⚠️ [PROTEKSI SYSTEM AKTIF] Autopilot Fallback Dijalankan:", error.message);
        return estimasiSkorFallback(teksBukuAsli, teksHafalanSiswa);
    }
}

// ---------------------------------------------------------------
// Feedback Kuis Objektif
// ---------------------------------------------------------------

function fallbackQuizFeedback(finalScore, studentName) {
    const name = studentName || 'Siswa';
    if (finalScore >= 90) return `Luar biasa, ${name}! Nilai sempurna ${finalScore}/100 menunjukkan pemahaman yang sangat baik. Teruslah belajar!`;
    if (finalScore >= 70) return `Bagus, ${name}! Skor ${finalScore}% — pertahankan prestasimu dan terus tingkatkan!`;
    if (finalScore >= 50) return `Cukup baik, ${name}! Skor ${finalScore}%. Ayo belajar lagi bagian yang masih kurang.`;
    return `${name}, skor ${finalScore}%. Jangan menyerah, coba baca ulang materinya dan uji lagi!`;
}

async function evaluateQuizFeedback(studentName, page, finalScore, totalSoal) {
    if (!ai) return fallbackQuizFeedback(finalScore, studentName);

    const quizPrompt = `
    Anda adalah Guru AI Interaktif untuk proyek EduBook.
    Siswa bernama ${studentName} menyelesaikan kuis di halaman ${page}.
    Total Nilai: ${finalScore} dari 100.
    Jumlah soal: ${totalSoal} Soal.

    Berikan ulasan evaluasi singkat (maksimal 20 kata) dalam bahasa Indonesia.
    Gunakan bahasa yang ramah dan santun: panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu").
    `;

    try {
        const result = await Promise.race([
            ai.models.generateContent({ model: PRIMARY_MODEL, contents: quizPrompt }),
            new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 20000))
        ]);

        return result.text ? result.text.trim() : fallbackQuizFeedback(finalScore, studentName);
    } catch (aiErr) {
        console.warn("⚠️ AI Quiz Feedback timeout/gagal, menggunakan fallback");
        return fallbackQuizFeedback(finalScore, studentName);
    }
}

// ---------------------------------------------------------------
// AI Content Insight (Sederhanakan / Bedah Ilmiah)
// ---------------------------------------------------------------

function fallbackExplanation(mode, text) {
    const snippet = text ? text.substring(0, 120) : 'materi';
    if (mode === 'simplify') {
        return `Intinya, ${snippet} — ini merupakan bagian dari konsep Internet of Things (IoT) yang menghubungkan perangkat ke internet agar bisa dikendalikan dari jarak jauh dengan mudah! 🌐✨`;
    }
    return `Secara ilmiah, ${snippet} — sistem ini mengintegrasikan lapisan transduser fisik (node sensor/aktuator) dengan komputasi awan menggunakan arsitektur mikrokontroler berbasis jaringan. 📡🔋`;
}

async function generateExplanation(text, mode) {
    if (!ai) return fallbackExplanation(mode, text);

    let promptInstruksi = "";
    if (mode === 'simplify') {
        promptInstruksi = `
        Anda adalah Guru AI Tutor yang ramah dan sabar untuk proyek EduBook (SIC Batch 8).
        Tugas Anda adalah menjelaskan materi rumit berikut menggunakan bahasa yang sangat sederhana, mudah dipahami anak-anak, dan menggunakan analogi sederhana.

        Materi: "${text}"

        Berikan penjelasan ringkas maksimal 2-3 kalimat dalam Bahasa Indonesia.
        Gunakan bahasa yang ramah dan santun: panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu").
        `;
    } else if (mode === 'detail') {
        promptInstruksi = `
        Anda adalah Ilmuwan & Engineer AIoT Senior dari Samsung Innovation Campus.
        Tugas Anda adalah membedah secara ilmiah konsep teknologi di dalam materi berikut. Hubungkan dengan sensor, mikrokontroler ESP32, aktuator, atau cloud database.

        Materi: "${text}"

        Berikan penjelasan ilmiah yang berbobot namun padat maksimal 3-4 kalimat dalam Bahasa Indonesia.
        Gunakan bahasa yang ramah dan santun: panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu").
        `;
    } else {
        promptInstruksi = `Jelaskan materi berikut secara singkat dan edukatif: "${text}"`;
    }

    try {
        const response = await Promise.race([
            ai.models.generateContent({ model: PRIMARY_MODEL, contents: promptInstruksi }),
            new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 25000))
        ]);

        return response.text ? response.text.trim() : fallbackExplanation(mode, text);
    } catch (aiErr) {
        console.warn("⚠️ Fitur explain timeout/gagal, menggunakan autopilot fallback.");
        return fallbackExplanation(mode, text);
    }
}

// ---------------------------------------------------------------
// Rekomendasi Belajar Personal (RAG sederhana)
// ---------------------------------------------------------------

function getGenderCall(gender) {
    if (gender === 'P') return 'sis';
    if (gender === 'L') return 'bro';
    return 'sobat';
}

function fallbackRecommendation(studentName, avgHafalan, avgQuiz, gender) {
    const call = getGenderCall(gender);
    const hafalanMsg = avgHafalan >= 70 ? `sudah mantap di angka ${avgHafalan}%` : `masih perlu ditingkatkan (${avgHafalan}%)`;
    const quizMsg = avgQuiz >= 70 ? `sudah cukup baik di angka ${avgQuiz}%` : `masih ${avgQuiz}% — perlu lebih banyak latihan soal`;
    const focus = avgHafalan > avgQuiz ? 'membaca ulang detail teknis seputar pinout mikrokontroler dan arsitektur IoT' : 'terus mengasah hafalan lisan dan pemahaman konsep dasar';
    return `Halo ${call} ${studentName}! Berdasarkan analisis cepat data lokal, rerata hafalan lisanmu ${hafalanMsg}. Sementara itu, pemahaman kognitif teorimu di kuis ${quizMsg}. Coba seimbangkan lagi porsi belajarmu dengan ${focus} ya! Semangat! 💪🔥`;
}

async function generateRecommendation(studentName, stats, gender) {
    const { avgHafalan, hafalanCount, avgQuiz, quizCount, totalLogs } = stats;
    const call = getGenderCall(gender);

    if (!ai) return fallbackRecommendation(studentName, avgHafalan, avgQuiz, gender);

    const recommendationPrompt = `
    Anda adalah Sistem Analisis AI Tutor Adaptif untuk proyek EduBook (Samsung Innovation Campus Batch 8).
    Tugas Anda adalah membaca ringkasan data performa belajar siswa berikut dan memberikan rekomendasi taktik belajar personal, spesifik, singkat, dan memotivasi dalam Bahasa Indonesia.

    Profil Siswa:
    - Nama: ${studentName}
    - Rerata Akurasi Review Lisan (Hafalan): ${avgHafalan}% (dari ${hafalanCount} kali percobaan)
    - Rerata Akurasi Kuis Objektif (Teori): ${avgQuiz}% (dari ${quizCount} kali percobaan)
    - Total Riwayat Aktivitas: ${totalLogs} sesi log tersimpan.

    Berikan ulasan maksimal 3-4 kalimat. Fokus pada ketimpangan nilai jika ada (misal: hafalan bagus tapi kuis rendah, atau sebaliknya) dan kaitkan dengan topik AIoT (ESP32, Sensor, MQTT, atau Machine Learning). Gunakan gaya bahasa tutor sebaya yang asyik namun tetap edukatif. Panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu"). Jika perlu menyapa, gunakan kata panggilan "${call}" untuk siswa ini.
    `;

    try {
        const result = await Promise.race([
            ai.models.generateContent({ model: PRIMARY_MODEL, contents: recommendationPrompt }),
            new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 25000))
        ]);

        return result.text ? result.text.trim() : fallbackRecommendation(studentName, avgHafalan, avgQuiz, gender);
    } catch (aiErr) {
        console.warn("⚠️ AI Recommendation Timeout/gagal, menggunakan rumus autopilot backend.");
        return fallbackRecommendation(studentName, avgHafalan, avgQuiz, gender);
    }
}

// ---------------------------------------------------------------
// Chat EduBot (dengan retry lintas model)
// ---------------------------------------------------------------

async function callGeminiWithRetry(promptSystem, maxRetries = 3) {
    if (!ai) throw new Error('AI_NOT_CONFIGURED');

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        for (const model of RETRY_MODELS) {
            try {
                console.log(`🤖 Attempt ${attempt}: Trying model ${model}...`);
                const response = await ai.models.generateContent({ model, contents: promptSystem });

                if (response && response.text) {
                    const text = response.text.trim();
                    if (text && text.length > 10) {
                        console.log(`✅ Success with model: ${model}`);
                        return text;
                    }
                }
            } catch (error) {
                console.log(`❌ Model ${model} failed:`, error.message);
                lastError = error;
                if (error.message.includes('503') || error.message.includes('UNAVAILABLE')) {
                    continue;
                }
                throw error;
            }
        }
        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 2000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError || new Error('All models failed');
}

// ---------------------------------------------------------------
// Feedback Jawaban Per Soal Kuis (variatif + penjelasan)
// ---------------------------------------------------------------

function fallbackQuizAnswerFeedback(isCorrect, correctAnswer) {
    if (isCorrect) {
        const variants = [
            'Kamu benar! Jawaban ini memang yang tepat. Lanjutkan!',
            'Tepat sekali, kamu menguasai materinya. Pertahankan!',
            'Benar! Kamu memang paham konsep ini. Semangat!'
        ];
        return variants[Math.floor(Math.random() * variants.length)];
    }
    const variants = [
        `Jawaban yang benar: ${correctAnswer}. Pelajari lagi bagian ini, pasti bisa!`,
        `Kunci jawabannya: ${correctAnswer}. Jangan menyerah, coba lagi!`,
        `Seharusnya: ${correctAnswer}. Semangat, kamu pasti paham setelah ini!`
    ];
    return variants[Math.floor(Math.random() * variants.length)];
}

async function generateQuizAnswerFeedback(question, options, correctAnswer, isCorrect, userAnswer) {
    if (!ai) return fallbackQuizAnswerFeedback(isCorrect, correctAnswer);

    const pilihan = (Array.isArray(options) && options.length)
        ? options.map((o, i) => `(${String.fromCharCode(65 + i)}) ${o}`).join('; ')
        : '(tidak ada pilihan)';

    const prompt = `
    Anda adalah Guru AI interaktif untuk proyek EduBook (Samsung Innovation Campus Batch 8).
    Seorang siswa baru saja menjawab satu soal kuis dan hasilnya ${isCorrect ? 'BENAR' : 'SALAH'}.

    Soal: "${question}"
    Pilihan jawaban: ${pilihan}
    Kunci jawaban benar: "${correctAnswer}"
    Jawaban siswa: ${isCorrect ? '(sesuai kunci)' : `"${userAnswer || '(tidak terjawab)'}"`}

    Berikan umpan balik maksimal 2 kalimat dalam Bahasa Indonesia yang:
    - Bervariasi antar soal (jangan selalu memulai dengan kata yang sama, gunakan gaya yang berbeda-beda).
    ${isCorrect
        ? '- Puji singkat dan jelaskan SEKILAS mengapa jawaban tersebut memang benar (1 alasan pedagogis sederhana).'
        : '- Tegur dengan ramah, sebutkan kunci jawaban yang benar, dan jelaskan mengapa jawaban tersebut yang tepat (1 alasan pedagogis sederhana).'}
    - Santun dan memotivasi; panggil siswa dengan "kamu" (jangan gunakan "lo", "gue", "gw", "lu").
    - Jangan gunakan markdown, kutipan, atau emoji berlebihan.

    Keluarkan HANYA teks feedback-nya saja.
    `;

    try {
        const result = await Promise.race([
            ai.models.generateContent({ model: PRIMARY_MODEL, contents: prompt }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000))
        ]);
        const text = result.text ? result.text.trim() : '';
        if (text && text.length > 5) return text;
        return fallbackQuizAnswerFeedback(isCorrect, correctAnswer);
    } catch (err) {
        console.warn('⚠️ Quiz answer feedback timeout/gagal, pakai fallback:', err.message);
        return fallbackQuizAnswerFeedback(isCorrect, correctAnswer);
    }
}

module.exports = {
    evaluateHafalan,
    evaluateQuizFeedback,
    generateExplanation,
    generateRecommendation,
    generateQuizAnswerFeedback,
    callGeminiWithRetry
};
