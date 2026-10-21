const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');
const { SUBJECT_CONTENT } = require('./subjectDatabase');

const CURRICULUM_FILE = path.join(__dirname, 'curriculumContent.json');

function loadJSON(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

const curriculumStore = loadJSON(CURRICULUM_FILE, {});

// INDEX[subject_id][fase] = daftar bab hasil generate kurikulum (AI).
// Mendukung 2 format cache: entri per-fase (punya field `fase`) dan entri
// gabungan (punya `fases`, tiap bab bertag `fase`). Entri gabungan diutamakan
// karena biasanya hasil generate yang lebih baru.
const CHAPTER_INDEX = {};
for (const [key, entry] of Object.entries(curriculumStore)) {
    if (!entry || !Array.isArray(entry.chapters) || entry.chapters.length === 0) continue;
    if (!entry.fase) continue;
    const sid = entry.subject_id || key.split('|')[0];
    if (!CHAPTER_INDEX[sid]) CHAPTER_INDEX[sid] = {};
    CHAPTER_INDEX[sid][entry.fase] = entry.chapters;
}
for (const [key, entry] of Object.entries(curriculumStore)) {
    if (!entry || !Array.isArray(entry.chapters) || entry.chapters.length === 0) continue;
    if (!Array.isArray(entry.fases)) continue;
    const sid = entry.subject_id || key.split('|')[0];
    if (!CHAPTER_INDEX[sid]) CHAPTER_INDEX[sid] = {};
    const grouped = {};
    for (const ch of entry.chapters) {
        if (!ch || !ch.fase) continue;
        (grouped[ch.fase] = grouped[ch.fase] || []).push(ch);
    }
    for (const [fase, chapters] of Object.entries(grouped)) {
        CHAPTER_INDEX[sid][fase] = chapters;
    }
}

function faseForKelas(jenjang, kelas) {
    if (jenjang === 'sd') {
        if (kelas <= 2) return 'A';
        if (kelas <= 4) return 'B';
        return 'C';
    }
    if (jenjang === 'smp') return 'D';
    return kelas === 10 ? 'E' : 'F';
}

function faseKelasMin(jenjang, fase) {
    if (jenjang === 'sd') return { A: 1, B: 3, C: 5 }[fase] || 1;
    if (jenjang === 'smp') return 7;
    return fase === 'E' ? 10 : 11;
}

function hasCurriculumContent(subject, kelas) {
    const fase = faseForKelas(subject.jenjang, kelas);
    const chapters = CHAPTER_INDEX[subject.subject_id]?.[fase];
    return Array.isArray(chapters) && chapters.length >= 3;
}

function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h || 1;
}

// Pengacakan deterministik: hasil seed selalu sama untuk input yang sama,
// supaya urutan soal tidak berubah-ubah setiap kali reseed.
function seededShuffle(array, seedStr) {
    const out = [...array];
    let s = hashString(seedStr);
    for (let i = out.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) >>> 0;
        const j = s % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function mapChapterQuiz(chapter) {
    const mapped = [];
    for (const q of chapter.quiz || []) {
        if (!q || typeof q.q !== 'string' || !Array.isArray(q.options) || q.options.length < 2) continue;
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) continue;
        mapped.push({
            question: q.q,
            options: q.options,
            correct_answer: q.options[q.answer],
            question_type: 'mcq'
        });
    }
    return mapped;
}

const QUIZ_POOL_TARGET = 30;

// Bank soal per halaman = 6 soal bab itu sendiri + soal dari bab lain dalam
// fase yang sama, diacak deterministik. Frontend mengambil 25 soal acak dari
// pool ini, jadi tiap sesi kuis bisa berbeda tanpa soal yang duplikat.
function buildQuizPool(chapters, chapterIndex, subject, kelas, pageNumber) {
    const own = mapChapterQuiz(chapters[chapterIndex]);
    const seen = new Set(own.map(q => q.question.toLowerCase().trim()));
    const extras = [];

    for (let j = 0; j < chapters.length; j++) {
        if (j === chapterIndex) continue;
        for (const q of mapChapterQuiz(chapters[j])) {
            const key = q.question.toLowerCase().trim();
            if (seen.has(key)) continue;
            seen.add(key);
            extras.push(q);
        }
    }

    const shuffledExtras = seededShuffle(extras, `${subject.subject_id}|${kelas}|${pageNumber}|pool`);
    const pool = [...own, ...shuffledExtras.slice(0, Math.max(0, QUIZ_POOL_TARGET - own.length))];
    return seededShuffle(pool, `${subject.subject_id}|${kelas}|${pageNumber}|order`);
}

function generatePages(subject, kelas) {
    if (hasCurriculumContent(subject, kelas)) {
        return generateCurriculumPages(subject, kelas);
    }
    return generateLegacyPages(subject, kelas);
}

function generateCurriculumPages(subject, kelas) {
    const fase = faseForKelas(subject.jenjang, kelas);
    const chapters = CHAPTER_INDEX[subject.subject_id][fase];

    // Untuk kelas kedua dalam fase yang sama (mis. kelas 12 vs 11, kelas 2 vs 1)
    // urutan bab digeser setengah supaya materi antar kelas tidak identik.
    const offset = kelas > faseKelasMin(subject.jenjang, fase) ? Math.floor(chapters.length / 2) : 0;
    const ordered = [...chapters.slice(offset), ...chapters.slice(0, offset)];

    const pages = [];
    for (let i = 0; i < 10; i++) {
        const chapterIdx = i % ordered.length;
        const chapter = ordered[chapterIdx];
        pages.push({
            title: chapter.title,
            paragraphs: (chapter.paragraphs || []).map((text, p) => ({ paragraph_id: p + 1, text })),
            quiz_questions: buildQuizPool(ordered, chapterIdx, subject, kelas, i + 1)
        });
    }
    return pages;
}

// Fallback khusus mapel/fase yang belum selesai di-generate AI.
// Tetap memakai bank materi lama, tapi jumlah soal per halaman dipangkas dan
// tidak lagi menduplikasi 200 soal.
function generateLegacyPages(subject, kelas) {
    const content = SUBJECT_CONTENT[subject.subject_id];
    if (!content) {
        return generateGenericPages(subject, kelas);
    }

    const pages = [];
    const totalQuestions = content.quiz.length;
    const questionsPerPage = Math.min(25, totalQuestions);

    for (let i = 0; i < 10; i++) {
        const topic = content.topics[i % content.topics.length];
        const title = `${topic}`;

        const paragraphs = [];
        for (let p = 0; p < 5; p++) {
            const factIndex = (i * 5 + p) % content.facts.length;
            paragraphs.push({
                paragraph_id: p + 1,
                text: content.facts[factIndex]
            });
        }

        const startIndex = (i * questionsPerPage) % totalQuestions;
        const pageQuestions = [];
        for (let q = 0; q < questionsPerPage; q++) {
            const qIndex = (startIndex + q) % totalQuestions;
            const qItem = content.quiz[qIndex];
            if (qItem.type === 'mcq') {
                pageQuestions.push({
                    question: qItem.q,
                    options: qItem.options,
                    correct_answer: qItem.options[qItem.a],
                    question_type: 'mcq'
                });
            } else if (qItem.type === 'fill_blank') {
                pageQuestions.push({
                    question: qItem.q,
                    correct_answer: qItem.answer,
                    question_type: 'fill_blank'
                });
            } else if (qItem.type === 'arrange_words') {
                pageQuestions.push({
                    question: 'Susun kata berikut menjadi kalimat yang benar:',
                    words: qItem.words,
                    correct_answer: qItem.answer,
                    question_type: 'arrange_words'
                });
            }
        }

        pages.push({ title, paragraphs, quiz_questions: pageQuestions });
    }

    return pages;
}

function generateGenericPages(subject, kelas) {
    const pages = [];
    for (let i = 0; i < 10; i++) {
        pages.push({
            title: `${subject.nama} - Topik ${i + 1}`,
            paragraphs: [
                { paragraph_id: 1, text: `${subject.nama} adalah mata pelajaran penting di jenjang ${subject.jenjang.toUpperCase()}.` },
                { paragraph_id: 2, text: `Pada kelas ${kelas}, siswa mempelajari konsep dasar ${subject.nama}.` },
                { paragraph_id: 3, text: `Pembelajaran ${subject.nama} bertujuan mengembangkan pemahaman siswa.` },
                { paragraph_id: 4, text: `${subject.nama} memiliki banyak aplikasi dalam kehidupan sehari-hari.` },
                { paragraph_id: 5, text: `Penguasaan ${subject.nama} penting untuk melanjutkan ke jenjang lebih tinggi.` }
            ],
            quiz_questions: [
                { question: `Apa yang dipelajari dalam ${subject.nama}?`, options: ['Konsep dasar', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], correct_answer: 'Konsep dasar', question_type: 'mcq' },
                { question: `Mengapa ${subject.nama} penting?`, options: ['Untuk kehidupan', 'Tidak penting', 'Hanya untuk ujian', 'Tidak ada gunanya'], correct_answer: 'Untuk kehidupan', question_type: 'mcq' },
                { question: `Di mana ${subject.nama} diterapkan?`, options: ['Kehidupan sehari-hari', 'Hanya di sekolah', 'Hanya di laboratorium', 'Tidak ada'], correct_answer: 'Kehidupan sehari-hari', question_type: 'mcq' },
                { question: `Siapa yang perlu belajar ${subject.nama}?`, options: ['Semua siswa', 'Hanya guru', 'Hanya orang pintar', 'Tidak ada'], correct_answer: 'Semua siswa', question_type: 'mcq' },
                { question: `Bagaimana cara belajar ${subject.nama} dengan baik?`, options: ['Latihan teratur', 'Menghafal semalam', 'Mencontek', 'Tidak belajar'], correct_answer: 'Latihan teratur', question_type: 'mcq' }
            ]
        });
    }
    return pages;
}

function generateAllBooks() {
    const books = [];
    let curriculumPages = 0;
    let legacyPages = 0;

    for (const subject of SUBJECTS) {
        for (let kelas = subject.kelas_min; kelas <= subject.kelas_max; kelas++) {
            const usingCurriculum = hasCurriculumContent(subject, kelas);
            const pages = generatePages(subject, kelas);

            for (let i = 0; i < pages.length; i++) {
                if (usingCurriculum) curriculumPages++; else legacyPages++;

                books.push({
                    subject_id: subject.subject_id,
                    jenjang: subject.jenjang,
                    kelas,
                    page_number: i + 1,
                    title: pages[i].title,
                    paragraphs: pages[i].paragraphs,
                    quiz_questions: pages[i].quiz_questions,
                    listening_questions: [],
                    image_url: '',
                    reference_link: '',
                    reference_author: '',
                    reference_title: '',
                    reference_year: '',
                    video_url: ''
                });
            }
        }
    }

    console.log(`  halaman berbasis kurikulum (AI) : ${curriculumPages}`);
    console.log(`  halaman fallback bank materi    : ${legacyPages}`);

    return books;
}

module.exports = { generateAllBooks, generatePages };
