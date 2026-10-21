/**
 * Generator materi buku EduBook.
 *
 * Materi TIDAK lagi pakai template. Setiap halaman dihasilkan Gemini sebagai
 * teks Oscar yang benar-benar berbeda satu sama lain (judul, 5 paragraf, 10 soal
 * kuis), lalu dilengkapi gambar nyata dari Wikimedia Commons dan sumber
 * referensi yang diverifikasi lewat API Wikipedia.
 *
 * video_url diisi dari videoCatalog.json berisi ID YouTube edukasi
 * per mapel. Frontend menyembunyikan blok video saat URL kosong.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const SUBJECTS = require('./subjects');

const MODEL = 'gemini-2.5-flash';
const CACHE_FILE = path.join(__dirname, 'imageCache.json');
const CATALOG_FILE = path.join(__dirname, 'mediaCatalog.json');
const VIDEO_CATALOG_FILE = path.join(__dirname, 'videoCatalog.json');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAGES_PER_SUBJECT = 10;

const JENJANG_TEKS = {
    1: 'kelas 1 SD', 2: 'kelas 2 SD', 3: 'kelas 3 SD', 4: 'kelas 4 SD', 5: 'kelas 5 SD', 6: 'kelas 6 SD',
    7: 'kelas 7 SMP', 8: 'kelas 8 SMP', 9: 'kelas 9 SMP',
    10: 'kelas 10 SMA', 11: 'kelas 11 SMA', 12: 'kelas 12 SMA'
};

function loadJSON(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

/* ---------------------------------------------------------------- gambar -- */

const imageCache = loadJSON(CACHE_FILE, {});
let commonsHits = 0;
let commonsMiss = 0;
let lastCommonsCall = 0;

/**
 * Normalisasi kata kunci sebelum dikirim ke Commons.
 * Gemini kadang menulis "network devices, switch router hub" - tanda koma
 * diperlakukan Commons sebagai teks literal sehingga selalu nol hasil.
 */
function normaliseQuery(raw) {
    return String(raw || '')
        .replace(/[,;/|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 4)
        .join(' ');
}

/**
 * Cari foto nyata di Wikimedia Commons untuk topik tertentu.
 * filetype:bitmap menyaring SVG (tidak bisa dirender di <img>).
 * Ada jeda + retry karena Commons membatasi laju request anonim.
 */
async function findCommonsImage(rawQuery) {
    const key = normaliseQuery(rawQuery);
    if (!key) return '';
    if (key in imageCache) return imageCache[key];

    let url = '';
    for (let attempt = 1; attempt <= 3 && !url; attempt++) {
        // Jeda minimal antar request supaya tidak kena rate limit.
        const gap = Date.now() - lastCommonsCall;
        if (gap < 400) await sleep(400 - gap);

        try {
            lastCommonsCall = Date.now();
            const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
                + '&generator=search&gsrnamespace=6&gsrlimit=6&prop=imageinfo'
                + '&iiprop=url&iiurlwidth=900'
                + `&gsrsearch=${encodeURIComponent(key + ' filetype:bitmap')}`;
            const res = await fetch(api, {
                headers: { 'User-Agent': 'EduBook/1.0 (educational prototype; contact: local dev)' },
                signal: AbortSignal.timeout(20000)
            });

            if (res.status === 429 || res.status === 503) {
                await sleep(2500 * attempt);
                continue;
            }

            const json = await res.json();
            const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
            const terms = key.split(/\s+/).filter(w => w.length > 3);
            const scored = pages.map(p => {
                const title = (p.title || '').toLowerCase();
                const ii = p.imageinfo && p.imageinfo[0];
                const thumb = (ii && ii.thumburl) || (ii && ii.url) || '';
                if (!/\.(jpe?g|png|webp)(\?|$)/i.test(thumb)) return null;
                const score = terms.reduce((acc, t) => acc + (title.includes(t) ? 1 : 0), 0);
                return { score, thumb };
            }).filter(Boolean).sort((a, b) => b.score - a.score);

            if (scored.length) url = scored[0].thumb;
            else break; // memang tidak ada hasil, tidak perlu retry
        } catch {
            await sleep(1200 * attempt);
        }
    }

    if (url) commonsHits++; else commonsMiss++;
    imageCache[key] = url;
    return url;
}

function saveImageCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(imageCache, null, 2));
}

/* -------------------------------------------------------------- referensi -- */

const catalog = loadJSON(CATALOG_FILE, {});
const videoCatalog = loadJSON(VIDEO_CATALOG_FILE, {});

function referenceFor(subject) {
    const entry = catalog[subject.subject_id];
    if (entry && entry.reference) return entry.reference;
    return {
        link: 'https://buku.kemendikdasmen.go.id/',
        title: 'Buku Sekolah Elektronik Kemendikdasmen',
        author: 'Kemendikdasmen',
        year: '2024'
    };
}

function videoFor(subject) {
    const entry = videoCatalog[subject.subject_id];
    if (entry && entry.video_id) return entry.video_id;
    return '';
}

/* ------------------------------------------------------------------ Gemini -- */

function buildPrompt(subject, kelas) {
    return `Kamu adalah penulis buku teks sekolah Indonesia yang ahli.

Tulis ${PAGES_PER_SUBJECT} BAB BERBEDA untuk buku pelajaran berikut:

Mapel    : ${subject.nama}
Jenjang  : ${JENJANG_TEKS[kelas] || 'kelas ' + kelas}
Topik    : ${subject.deskripsi || subject.nama}

ATURAN WAJIB:
1. Setiap bab harus topik yang BERBEDA satu sama lain. Jangan mengulang konsep.
2. Isi harus faktual dan nyata, sesuai materi ${JENJANG_TEKS[kelas] || ''}. BolehACY _: pakai bahasa yang mudah dipahami siswa.
3. Sesuaikan kedalaman bahasa dengan jenjang (kelas 1-3 sangat sederhana, kelas 10-12 boleh teknis).
4. Setiap paragraf 3-5 kalimat, berisi penjelasan nyata, bukan kalimat kosong seperti "materi ini menarik".
5. Setiap soal kuis WAJIB berdasarkan isi bab tersebut, bukan soal generik.
6. Untuk "image_query", tulis 2-4 kata kunci visual dalam BAHASA INGGRIS (dipakai mencari foto di Wikimedia Commons), spesifik pada isi bab itu. JANGAN pakai tanda koma - pakai spasi.
7. Jangan mengulang kata "lalu", "kemudian", "selain itu" di awal tiap paragraf.
8. Judul bab TIDAK boleh diawali "BAB 1:", "BAB 2:", atau nomor bab apa pun. Tulis judul yang menjelaskan isi secara langsung.

Balas HANYA JSON valid dengan bentuk:
{"pages": [
  {
    "title": "judul bab yang spesifik",
    "paragraphs": ["paragraf 1", "paragraf 2", "paragraf 3", "paragraf 4", "paragraf 5"],
    "quiz_questions": [
      {"question": "...", "options": ["a","b","c","d"], "correct_answer": "a"}
    ],
    "image_query": "two to four english keywords"
  }
]}

Balas ${PAGES_PER_SUBJECT} objek pages.`;
}

function parsePages(text) {
    if (!text) return null;
    const cleaned = String(text).replace(/```json/g, '').replace(/```/g, '');
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s === -1 || e <= s) return null;
    try {
        const json = JSON.parse(cleaned.slice(s, e + 1));
        if (!json || !Array.isArray(json.pages)) return null;
        return json.pages;
    } catch {
        return null;
    }
}

function normalisePage(raw, index) {
    const paragraphs = (raw.paragraphs || [])
        .filter(p => typeof p === 'string' && p.trim().length > 40)
        .slice(0, 5)
        .map((text, i) => ({ paragraph_id: i + 1, text: text.trim() }));

    const quiz = (raw.quiz_questions || [])
        .filter(q => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
        .map(q => ({
            question: String(q.question).trim(),
            options: q.options.map(o => String(o)),
            correct_answer: String(q.correct_answer || q.options[0]),
            question_type: 'mcq'
        }));

    return {
        title: String(raw.title || '').trim(),
        paragraphs,
        quiz: quiz,
        imageQuery: String(raw.image_query || '').trim()
    };
}

/** Generating satu (mapel, kelas) = 10 halaman. Retry kalau output rusak. */
async function generateSubjectKelas(subject, kelas, onProgress) {
    if (!ai) throw new Error('GEMINI_API_KEY tidak diset');

    for (let attempt = 1; attempt <= 4; attempt++) {
        try {
            const res = await ai.models.generateContent({
                model: MODEL,
                contents: buildPrompt(subject, kelas),
                config: { responseMimeType: 'application/json' }
            });
            const pages = parsePages(res?.text);
            if (pages && pages.length >= PAGES_PER_SUBJECT) {
                return pages.map((p, i) => normalisePage(p, i)).filter(p => p.title && p.paragraphs.length >= 3);
            }
            // Output tidak lengkap -> coba lagi.
            if (attempt < 4) await sleep(3000 * attempt);
        } catch (err) {
            const msg = String(err.message || err);
            if (/RESOURCE_EXHAUSTED|429|rate/i.test(msg)) {
                await sleep(15000 * attempt);
            } else {
                await sleep(2500 * attempt);
            }
            if (attempt === 4) throw new Error(`Gagal generate ${subject.subject_id} kelas ${kelas}: ${msg}`);
        }
    }
    return [];
}

/* ------------------------------------------------------------------ build -- */

/**
 * Membangun seluruh buku. Mengembalikan array dokumen Book.
 * onProgress(current, total, label) dipakai seed.js untuk menampilkan progres.
 */
async function generateAllBooks(onProgress = () => { }, options = {}) {
    const only = options.only ? new Set(options.only) : null;
    const targets = SUBJECTS.filter(s => !only || only.has(s.subject_id));

    // 1. Kumpulkan seluruh unit (mapel, kelas) yang perlu digenerate.
    const units = [];
    for (const subject of targets) {
        for (let kelas = subject.kelas_min; kelas <= subject.kelas_max; kelas++) {
            units.push({ subject, kelas });
        }
    }

    const books = [];
    let done = 0;

    for (const { subject, kelas } of units) {
        let pages = [];
        try {
            pages = await generateSubjectKelas(subject, kelas);
        } catch (err) {
            console.error(`\n  ! ${subject.subject_id} kelas ${kelas}: ${err.message}`);
        }

        const ref = referenceFor(subject);

        for (let i = 0; i < Math.min(pages.length, PAGES_PER_SUBJECT); i++) {
            const p = pages[i];
            const imageQuery = p.imageQuery || `${subject.nama} ${p.title}`;
            const imageUrl = await findCommonsImage(imageQuery);

            books.push({
                subject_id: subject.subject_id,
                jenjang: subject.jenjang,
                kelas,
                page_number: i + 1,
                title: `${p.title}`,
                paragraphs: p.paragraphs,
                quiz_questions: p.quiz,
                image_url: imageUrl,
                reference_link: ref.link,
                reference_author: ref.author,
                reference_title: ref.title,
                reference_year: ref.year,
                video_url: ''   // sengaja kosong: tidak ada ID YouTube yang terverifikasi
            });
        }

        done++;
        onProgress(done, units.length, `${subject.subject_id} kelas ${kelas}`);
        saveImageCache();
        await sleep(700); // jaga rate limit
    }

    return books;
}

module.exports = {
    generateAllBooks,
    loadJSON,
    generateSubjectKelas,
    findCommonsImage,
    PAGES_PER_SUBJECT,
    getImageCache: () => imageCache,
    getCommonsStats: () => ({ hits: commonsHits, miss: commonsMiss })
};
