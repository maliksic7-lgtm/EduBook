/**
 * Generator konten kurikulum EduBook (berbasis materi dinas / Kurikulum Merdeka).
 *
 * Satu panggilan per MAPEL (semua fase sekaligus, tiap bab diberi tag fase).
 * Hasil disimpan incremental ke curriculumContent.json -> bisa di-resume.
 *
 * Kuota free-tier Gemini terpisah per model, jadi script merotasi beberapa
 * model otomatis: model yang kena 429-quota ditandai habis, model yang 503
 * (high demand) dikasih cooldown lalu dicoba lagi.
 *
 * Jalankan: node seeds/generateCurriculumContent.js [--parallel=3] [--only=prefix] [--limit=N] [--force]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const SUBJECTS = require('./subjects');

const OUTPUT_FILE = path.join(__dirname, 'curriculumContent.json');
const THROTTLE_MS = 2500;
const MAX_ATTEMPTS = 10;

const MODEL_POOL_DEFAULT = [
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-3.7-flash'
];

const args = process.argv.slice(2);
const ONLY = (args.find(a => a.startsWith('--only=')) || '').split('=')[1] || '';
const LIMIT = Number((args.find(a => a.startsWith('--limit=')) || '').split('=')[1] || 0) || 0;
const FORCE = args.includes('--force');
const REVERSE = args.includes('--reverse');
const PARALLEL = Math.max(1, Number((args.find(a => a.startsWith('--parallel=')) || '').split('=')[1] || 3) || 3);
const MODELS_ARG = (args.find(a => a.startsWith('--models=')) || '').split('=')[1] || '';
const MODEL_POOL = MODELS_ARG ? MODELS_ARG.split(',').map(s => s.trim()).filter(Boolean) : MODEL_POOL_DEFAULT;

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 240000 }
}) : null;
if (!ai) {
    console.error('GEMINI_API_KEY tidak ditemukan di .env');
    process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loadJSON(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

const store = loadJSON(OUTPUT_FILE, {});

function fasesForSubject(s) {
    const out = [];
    if (s.jenjang === 'sd') {
        [[1, 2, 'A'], [3, 4, 'B'], [5, 6, 'C']].forEach(([a, b, fase]) => {
            const lo = Math.max(a, s.kelas_min);
            const hi = Math.min(b, s.kelas_max);
            if (lo <= hi) out.push({ fase, kelas_min: lo, kelas_max: hi });
        });
    } else if (s.jenjang === 'smp') {
        out.push({ fase: 'D', kelas_min: Math.max(7, s.kelas_min), kelas_max: Math.min(9, s.kelas_max) });
    } else {
        if (s.kelas_min <= 10 && s.kelas_max >= 10) out.push({ fase: 'E', kelas_min: 10, kelas_max: 10 });
        const lo = Math.max(11, s.kelas_min);
        if (lo <= s.kelas_max) out.push({ fase: 'F', kelas_min: lo, kelas_max: s.kelas_max });
    }
    return out;
}

function faseKey(s, f) {
    return `${s.subject_id}|${f.fase}|${f.kelas_min}-${f.kelas_max}`;
}

function priorityOf(s) {
    if (s.jenjang === 'smk' && s.kategori === 'kejuruan') return 0;
    if (s.jenjang === 'sma' && s.kategori === 'peminatan') return 1;
    if (s.jenjang === 'smk') return 2;
    if (s.jenjang === 'sma') return 3;
    if (s.jenjang === 'smp') return 4;
    return 5;
}

function buildJobs() {
    const jobs = [];
    for (const s of SUBJECTS) {
        if (ONLY && !s.subject_id.startsWith(ONLY)) continue;
        // Entri gabungan (semua fase dalam satu dokumen) menutup semua fase
        // mapel ini; entri per-fase hanya menutup fase yang sama.
        if (!FORCE && store[s.subject_id] && Array.isArray(store[s.subject_id].chapters)) continue;
        const fases = fasesForSubject(s);
        for (const f of fases) {
            if (!FORCE && store[faseKey(s, f)]) continue;
            jobs.push({ subject: s, fase: f });
        }
    }
    jobs.sort((a, b) => priorityOf(a.subject) - priorityOf(b.subject) || a.subject.subject_id.localeCompare(b.subject.subject_id));
    if (REVERSE) jobs.reverse();
    return LIMIT > 0 ? jobs.slice(0, LIMIT) : jobs;
}

const FASE_LABEL = { A: 'kelas 1-2 (Fase A)', B: 'kelas 3-4 (Fase B)', C: 'kelas 5-6 (Fase C)', D: 'kelas 7-9 (Fase D)', E: 'kelas 10 (Fase E)', F: 'kelas 11-12 (Fase F)' };

function buildPrompt(job) {
    const s = job.subject;
    const f = job.fase;
    const jenjangLabel = { sd: 'SD/MI', smp: 'SMP/MTs', sma: 'SMA/MA', smk: 'SMK/MAK' }[s.jenjang];
    const kejuruanNote = s.kategori === 'kejuruan'
        ? `Mata pelajaran kejuruan ini adalah bagian dari kompetensi keahlian bidang vokasi. Gunakan materi produktif kejuruan yang nyata dan spesifik (istilah teknis, alat, prosedur kerja), bukan materi umum.`
        : '';
    const peminatanNote = s.kategori === 'peminatan'
        ? `Ini mata pelajaran peminatan ${String(s.peminatan || '').toUpperCase()}, gunakan kedalaman materi tingkat lanjut yang sesuai.`
        : '';
    const isEnglish = /bahasa inggris|english/i.test(s.nama);
    const englishNote = isEnglish
        ? `Mata pelajaran ini adalah Bahasa Inggris. Sajikan pembelajaran bahasa Inggris yang LANGSUNG berguna untuk siswa: kosakata penting, ungkapan/dialog siap pakai, tata bahasa yang dijelaskan lewat contoh pemakaian nyata, serta contoh teks sesuai jenjang (descriptive, narrative, recount, procedure, report, dan sejenisnya). Tulis penjelasan dalam Bahasa Indonesia, tetapi semua contoh kosakata/ungkapan/teks dalam Bahasa Inggris. DILARANG menulis pembahasan tentang cara belajar/mengajar Bahasa Inggris, kesulitan siswa, atau analisis kondisi pendidikan — itu bukan materi ajar.`
        : '';

    return `Kamu adalah penulis buku teks resmi Kurikulum Merdeka (Kemendikdasmen).
Susun isi buku mata pelajaran "${s.nama}" jenjang ${jenjangLabel} untuk ${FASE_LABEL[f.fase]}.
${kejuruanNote}
${peminatanNote}
${englishNote}

Ketentuan:
- Tepat 10 bab berurutan sesuai capaian pembelajaran resmi fase tersebut.
- Setiap bab punya "title": judul bab nyata (2-6 kata) yang spesifik menggambarkan isi materi bab itu.
- Setiap bab punya "paragraphs": tepat 5 paragraf penjelasan materi. Setiap paragraf 2-3 kalimat baku berisi fakta/penjelasan kelimuan yang BENAR dan spesifik, sesuai tingkat pemahaman siswa fase tersebut.
- Semua paragraf WAJIB berupa materi ajar langsung untuk SISWA (penjelasan konsep, contoh nyata, langkah kerja, fakta). DILARANG membahas cara mengajar, metode pengajaran, kondisi kelas, peran guru, atau kebijakan kurikulum — itu bukan materi ajar.
- Setiap bab punya "quiz": tepat 6 soal pilihan ganda yang menguji pemahaman isi bab. 4 opsi jawaban, "answer" = indeks opsi benar (0-3). Distraktor harus masuk akal (bukan opsi candaan).
- Setiap bab punya "fase": isi dengan "${f.fase}" untuk semua bab.
- DILARANG memakai kalimat generik/placeholder seperti: "merupakan bidang penting", "bertujuan mengembangkan pemahaman", "terdapat beberapa komponen utama", "penerapan ... sangat beragam", "dipelajari lebih lanjut". Setiap bab harus membahas topik yang berbeda dari bab lain.
- Bahasa Indonesia baku, tanpa emoji, tanpa markdown, tanpa numbering di dalam teks paragraf.

Balas HANYA JSON valid dengan bentuk:
{"chapters":[{"fase":"${f.fase}","title":"...","paragraphs":["...","...","...","...","..."],"quiz":[{"q":"...","options":["...","...","...","..."],"answer":0}, {"q":"...","options":["...","...","...","..."],"answer":2}, {"q":"...","options":["...","...","...","..."],"answer":1}, {"q":"...","options":["...","...","...","..."],"answer":3}, {"q":"...","options":["...","...","...","..."],"answer":0}, {"q":"...","options":["...","...","...","..."],"answer":2}]}]}`;
}

const BANNED_PATTERNS = [
    /merupakan bidang penting/i,
    /bertujuan mengembangkan pemahaman/i,
    /terdapat beberapa komponen utama/i,
    /sangat beragam\./i,
    /dipelajari lebih lanjut/i,
    /merupakan mata pelajaran penting/i,
    /metode pengajaran/i,
    /kelas reguler/i,
    /cara guru/i,
    /dominasi teori/i
];

function validateResult(parsed, job) {
    if (!parsed || !Array.isArray(parsed.chapters)) return 'chapters bukan array';
    if (parsed.chapters.length !== 10) return `jumlah bab ${parsed.chapters.length}, harus 10`;

    for (const ch of parsed.chapters) {
        if (!ch || ch.fase !== job.fase.fase) return `bab dengan fase tidak sesuai (harus ${job.fase.fase})`;
    }

    for (let i = 0; i < parsed.chapters.length; i++) {
        const ch = parsed.chapters[i];
        if (typeof ch.title !== 'string' || ch.title.trim().length < 3) return `bab ${i + 1}: title tidak valid`;
        if (!Array.isArray(ch.paragraphs) || ch.paragraphs.length !== 5) return `bab ${i + 1}: paragraphs harus 5`;
        for (const p of ch.paragraphs) {
            if (typeof p !== 'string' || p.trim().length < 60) return `bab ${i + 1}: paragraf terlalu pendek`;
            if (BANNED_PATTERNS.some(re => re.test(p))) return `bab ${i + 1}: paragraf mengandung kalimat generik`;
        }
        if (!Array.isArray(ch.quiz) || ch.quiz.length < 4) return `bab ${i + 1}: quiz kurang dari 4`;
        for (const q of ch.quiz) {
            if (!q || typeof q.q !== 'string' || q.q.trim().length < 8) return `bab ${i + 1}: pertanyaan tidak valid`;
            if (!Array.isArray(q.options) || q.options.length !== 4) return `bab ${i + 1}: options harus 4`;
            if (new Set(q.options.map(o => String(o).toLowerCase().trim())).size !== 4) return `bab ${i + 1}: opsi duplikat`;
            if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return `bab ${i + 1}: answer tidak valid`;
        }
    }
    return null;
}

function stripFences(text) {
    let t = String(text || '').trim();
    if (t.startsWith('```')) {
        t = t.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }
    const first = t.indexOf('{');
    const last = t.lastIndexOf('}');
    if (first >= 0 && last > first) t = t.slice(first, last + 1);
    return t;
}

// ------------------------------------------------------------------ rotasi model
const modelState = new Map(MODEL_POOL.map(m => [m, { exhausted: false, cooldownUntil: 0, used: 0, strikes: 0 }]));
let roundRobin = 0;

function pickModel() {
    const now = Date.now();
    const avail = MODEL_POOL.filter(m => {
        const st = modelState.get(m);
        return !st.exhausted && st.cooldownUntil <= now;
    });
    if (avail.length === 0) return null;
    roundRobin = (roundRobin + 1) % avail.length;
    return avail[roundRobin];
}

function markExhausted(model) {
    const st = modelState.get(model);
    if (st && !st.exhausted) {
        st.exhausted = true;
        console.log(`   [model] ${model} kuota harian habis`);
    }
}

function markCooldown(model, ms) {
    const st = modelState.get(model);
    if (st) st.cooldownUntil = Date.now() + ms;
}

function aliveModels() {
    return MODEL_POOL.filter(m => !modelState.get(m).exhausted).length;
}

const modelCapabilities = new Map(); // model -> { skipThinkingConfig: boolean }

function buildGenConfig(model, attempt) {
    const caps = modelCapabilities.get(model) || {};
    const config = {
        temperature: attempt === 1 ? 0.65 : 0.5,
        maxOutputTokens: 55000,
        responseMimeType: 'application/json'
    };
    if (!caps.skipThinkingConfig) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }
    return config;
}

async function generateForJob(job) {
    const prompt = buildPrompt(job);
    let lastErr = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (aliveModels() === 0) {
            throw new Error('semua model sudah habis kuota hari ini');
        }

        const model = pickModel();
        if (!model) {
            await sleep(30000);
            continue;
        }

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: buildGenConfig(model, attempt)
            });
            modelState.get(model).used++;

            const text = stripFences(response.text);
            const parsed = JSON.parse(text);
            const invalid = validateResult(parsed, job);
            if (invalid) {
                lastErr = new Error(`validasi: ${invalid}`);
                console.log(`   [retry] validasi gagal attempt ${attempt}/${MAX_ATTEMPTS} model=${model}: ${invalid}`);
                await sleep(1000);
                continue;
            }
            modelState.get(model).strikes = 0;
            return { parsed, model };
        } catch (err) {
            lastErr = err;
            const msg = String(err.message || '');
            console.log(`   [retry] attempt ${attempt}/${MAX_ATTEMPTS} model=${model}: ${msg.replace(/\s+/g, ' ').slice(0, 110)}`);
            if (msg.includes('400') && msg.toLowerCase().includes('thinking')) {
                if (!modelCapabilities.has(model)) modelCapabilities.set(model, {});
                modelCapabilities.get(model).skipThinkingConfig = true;
                console.log(`   [model] ${model} tidak mendukung thinkingConfig, lanjut tanpa konfigurasi thinking.`);
                attempt--;
                continue;
            }
            if (msg.includes('429') && (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('too many requests'))) {
                const st = modelState.get(model);
                if (st) {
                    st.strikes = (st.strikes || 0) + 1;
                    if (st.strikes >= 4) {
                        markExhausted(model);
                    } else {
                        markCooldown(model, 150 * 1000);
                        console.log(`   [model] ${model} kena 429 (strike ${st.strikes}/4), cooldown 150s`);
                    }
                }
                await sleep(6000);
                continue;
            }
            if (msg.includes('503') || msg.toLowerCase().includes('unavailable')) {
                markCooldown(model, 45 * 1000);
                await sleep(5000);
                continue;
            }
            if (msg.includes('404')) {
                markExhausted(model);
                continue;
            }
            markCooldown(model, 20 * 1000);
            await sleep(2000);
        }
    }
    throw lastErr || new Error('gagal tanpa error spesifik');
}

function saveStore() {
    // Merge dengan isi file di disk dulu supaya aman saat beberapa instance
    // berjalan paralel (masing-masing mengerjakan bagian yang berbeda).
    try {
        const onDisk = loadJSON(OUTPUT_FILE, {});
        for (const k of Object.keys(onDisk)) {
            if (!store[k]) store[k] = onDisk[k];
        }
    } catch (e) {}
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(store, null, 2));
}

async function main() {
    const jobs = buildJobs();
    console.log(`Total mapel pending: ${jobs.length} (paralel ${PARALLEL}), cache per-mapel: ${Object.keys(store).length}`);
    if (jobs.length === 0) {
        console.log('Semua sudah ter-generate.');
        return;
    }

    const t0 = Date.now();
    let done = 0;
    let failed = 0;
    let processed = 0;
    const queue = [...jobs];

    async function worker(workerId) {
        while (queue.length > 0) {
            if (aliveModels() === 0) return;
            const job = queue.shift();
            if (!job) break;
            const label = `${job.subject.subject_id} [${job.fase.fase}]`;
            const started = Date.now();
            console.log(`[W${workerId}] START ${label} (10 bab)`);
            try {
                const { parsed, model } = await generateForJob(job);
                store[faseKey(job.subject, job.fase)] = {
                    subject_id: job.subject.subject_id,
                    nama: job.subject.nama,
                    jenjang: job.subject.jenjang,
                    fase: job.fase.fase,
                    kelas_min: job.fase.kelas_min,
                    kelas_max: job.fase.kelas_max,
                    chapters: parsed.chapters,
                    generated_at: new Date().toISOString(),
                    model
                };
                saveStore();
                done++;
                processed++;
                const quizCount = parsed.chapters.reduce((a, c) => a + c.quiz.length, 0);
                console.log(`[${processed}/${jobs.length}] W${workerId} ${label} OK via ${model} (${Math.round((Date.now() - started) / 1000)}s, ${quizCount} soal)`);
            } catch (err) {
                failed++;
                processed++;
                console.log(`[${processed}/${jobs.length}] W${workerId} ${label} GAGAL: ${err.message}`);
            }
            await sleep(THROTTLE_MS + Math.floor(Math.random() * 1500));
        }
    }

    const workers = [];
    for (let w = 1; w <= PARALLEL; w++) workers.push(worker(w));
    await Promise.all(workers);

    console.log(`\nSelesai. sukses=${done} gagal=${failed} total_cache=${Object.keys(store).length} durasi=${Math.round((Date.now() - t0) / 60000)}m`);
    console.log('Kuota terpakai hari ini:', MODEL_POOL.map(m => `${m}=${modelState.get(m).used}${modelState.get(m).exhausted ? '(habis)' : ''}`).join('  '));
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
