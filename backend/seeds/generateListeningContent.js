const fs = require('fs');
const path = require('path');
const SUBJECTS = require('./subjects');

function mcq(q, options, a) { return { q, options, a, type: 'listening_mcq' }; }

const LISTENING_TEMPLATES = [
    { q: 'Apa yang dipelajari dalam {nama}?', options: ['Konsep dasar', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0 },
    { q: 'Mengapa {nama} penting dipelajari?', options: ['Fondasi pengetahuan', 'Tidak penting', 'Hanya untuk ujian', 'Membuang waktu'], a: 0 },
    { q: 'Bagaimana cara terbaik mempelajari {nama}?', options: ['Latihan konsisten', 'Menghafal semalam', 'Mencontek', 'Menghindar'], a: 0 },
    { q: 'Apa manfaat {nama} dalam kehidupan sehari-hari?', options: ['Membantu pemecahan masalah', 'Tidak ada manfaat', 'Membingungkan', 'Menyulitkan'], a: 0 },
    { q: 'Siapa yang perlu mempelajari {nama}?', options: ['Semua siswa', 'Hanya guru', 'Hanya orang tua', 'Tidak ada yang perlu'], a: 0 },
    { q: 'Kapan sebaiknya mempelajari {nama}?', options: ['Secara berkala', 'Hanya saat ujian', 'Tidak perlu', 'Saat bosan'], a: 0 },
    { q: 'Di mana dapat belajar {nama}?', options: ['Sekolah dan rumah', 'Hanya sekolah', 'Hanya rumah', 'Tidak bisa belajar'], a: 0 },
    { q: 'Apa hasil belajar {nama} yang baik?', options: ['Pemahaman mendalam', 'Nilai tinggi', 'Hafalan sempurna', 'Tidak ada hasil'], a: 0 },
    { q: 'Bagaimana mengukur kemajuan belajar {nama}?', options: ['Evaluasi berkala', 'Tidak diukur', 'Dengan tebakan', 'Dengan perasaan'], a: 0 },
    { q: 'Apa komponen utama {nama}?', options: ['Konsep kunci', 'Hal tidak relevan', 'Kesulitan', 'Hambatan'], a: 0 },
    { q: 'Apa fungsi {nama}?', options: ['Membantu pemecahan masalah', 'Tidak ada fungsi', 'Membingungkan', 'Menyulitkan'], a: 0 },
    { q: 'Apa penerapan {nama} dalam kehidupan nyata?', options: ['Sangat beragam', 'Tidak ada', 'Hanya satu', 'Tidak relevan'], a: 0 },
    { q: 'Apa peran {nama} dalam pengembangan keterampilan?', options: ['Penting', 'Tidak penting', 'Kurang penting', 'Tidak ada peran'], a: 0 },
    { q: 'Apa fondasi untuk pembelajaran {nama} lebih lanjut?', options: ['Konsep dasar', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0 },
    { q: 'Apa yang diajarkan {nama} dalam kehidupan sehari-hari?', options: ['Nilai-nilai penting', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0 },
    { q: 'Apa tujuan pembelajaran {nama}?', options: ['Mengembangkan pemahaman', 'Tidak ada tujuan', 'Hanya untuk ujian', 'Membuang waktu'], a: 0 },
    { q: 'Apa yang perlu dikuasai dalam {nama}?', options: ['Komponen utama', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0 },
    { q: 'Apa yang dibutuhkan untuk menguasai {nama}?', options: ['Latihan konsisten', 'Tidak ada', 'Hanya menghafal', 'Hanya mencontek'], a: 0 },
    { q: 'Apa yang membantu mengukur kemajuan belajar {nama}?', options: ['Evaluasi berkala', 'Tidak ada', 'Hanya nilai', 'Hanya perasaan'], a: 0 },
    { q: 'Apa yang bermanfaat dalam berbagai situasi dari {nama}?', options: ['Konsep dasar', 'Tidak ada', 'Hanya teori', 'Hanya praktik'], a: 0 }
];

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const LISTENING_CONTENT = {};

for (const subject of SUBJECTS) {
    const nama = subject.nama;
    const jenjang = subject.jenjang.toUpperCase();

    const topics = [
        `Pengenalan ${nama}`,
        `Konsep Dasar ${nama}`,
        `Sejarah ${nama}`,
        `Komponen ${nama}`,
        `Fungsi ${nama}`,
        `Penerapan ${nama}`,
        `Manfaat ${nama}`,
        `Metode ${nama}`,
        `Evaluasi ${nama}`,
        `Kesimpulan ${nama}`
    ];

    const facts = [
        `${nama} adalah mata pelajaran penting dalam pendidikan ${jenjang}.`,
        `Pembelajaran ${nama} bertujuan mengembangkan pemahaman siswa tentang konsep-konsep kunci.`,
        `Dalam ${nama}, terdapat beberapa komponen utama yang perlu dikuasai.`,
        `Penerapan ${nama} dalam kehidupan nyata sangat beragam.`,
        `Untuk menguasai ${nama}, diperlukan latihan konsisten dan pemahaman mendalam.`,
        `${nama} memiliki peran penting dalam pengembangan keterampilan siswa.`,
        `Konsep dasar ${nama} menjadi fondasi untuk pembelajaran lebih lanjut.`,
        `Siswa diajak memahami bagaimana ${nama} bermanfaat dalam berbagai situasi.`,
        `Evaluasi berkala membantu mengukur kemajuan belajar ${nama}.`,
        `${nama} mengajarkan nilai-nilai penting yang diterapkan dalam kehidupan sehari-hari.`
    ];

    const quiz = [];
    for (let i = 0; i < 200; i++) {
        const t = LISTENING_TEMPLATES[i % LISTENING_TEMPLATES.length];
        quiz.push(mcq(t.q.replace('{nama}', nama), t.options, t.a));
    }

    LISTENING_CONTENT[subject.subject_id] = { topics, facts, quiz: shuffleArray(quiz) };
}

function main() {
    let output = 'const LISTENING_CONTENT = {\n';
    for (const [id, content] of Object.entries(LISTENING_CONTENT)) {
        output += '    ' + id + ': {\n        topics: ' + JSON.stringify(content.topics) + ',\n        facts: ' + JSON.stringify(content.facts) + ',\n        quiz: ' + JSON.stringify(content.quiz) + '\n    },\n';
    }
    output += '};\n\nmodule.exports = { LISTENING_CONTENT };\n';
    fs.writeFileSync(path.join(__dirname, 'listeningContent.js'), output, 'utf8');
    console.log('Generated listeningContent.js with ' + Object.keys(LISTENING_CONTENT).length + ' subjects (200 questions each)');
}
main();
