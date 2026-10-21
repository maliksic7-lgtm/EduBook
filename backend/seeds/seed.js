/**
 * Seedorator EduBook.
 *
 * Alur:
 *   1. Backup seluruh Book lama ke file JSON (bisa dikembalikan kalau gagal).
 *   2. Subjects + generate materi static (deterministic, tanpa API).
 *   3. Replace data buku, insert per batch dengan progres.
 *
 * Jalankan:  npm run seed
 * Args     :  --only=subject_id   (untuk uji satu mapel dulu)
 *             --keep-books        (jangan hapus buku lama; upsert saja)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Book = require('../models/Book');
const SUBJECTS = require('./subjects');
const { generateAllBooks: generateStaticBooks } = require('./staticContent');
const { loadJSON } = require('./books');

const BACKUP_DIR = path.join(__dirname, 'backup');
const args = process.argv.slice(2);
const ONLY = (args.find(a => a.startsWith('--only=')) || '').split('=')[1];
const KEEP_BOOKS = args.includes('--keep-books');

function stamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function fmtDuration(ms) {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

async function backupBooks() {
    const count = await Book.countDocuments();
    if (count === 0) return null;
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, `books-${stamp()}.json`);
    const cursor = Book.find().cursor();
    const out = fs.createWriteStream(file);
    let written = 0;
    out.write('[');
    for await (const doc of cursor) {
        if (written++ > 0) out.write(',');
        out.write(JSON.stringify(doc));
    }
    out.write(']');
    await new Promise(resolve => out.end(resolve));
    console.log(`  backup ${count} buku lama -> ${file}`);
    return file;
}

async function insertInBatches(books, size = 200) {
    for (let i = 0; i < books.length; i += size) {
        await Book.insertMany(books.slice(i, i + size), { ordered: false });
    }
}

async function main() {
    const t0 = Date.now();
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');
    console.log('Terhubung ke MongoDB');

    console.log('\n=== 1. Backup data lama ===');
    await backupBooks();

    console.log('\n=== 2. Subjects ===');
    await Subject.deleteMany({});
    await Subject.insertMany(SUBJECTS);
    console.log(`  ${SUBJECTS.length} mapel dimasukkan`);

    console.log('\n=== 3. Generate materi (static, deterministic) ===');
    const catalog = loadJSON(path.join(__dirname, 'mediaCatalog.json'), {});

    // Simpan media hasil warmer lama (video/ilustrasi) agar tidak perlu
    // di-resolve ulang untuk halaman yang sudah punya.
    const existingMedia = new Map();
    {
        const cursor = Book.find({}).select('subject_id kelas page_number video_url image_url').lean().cursor();
        for await (const doc of cursor) {
            if (doc.video_url || doc.image_url) {
                existingMedia.set(`${doc.subject_id}|${doc.kelas}|${doc.page_number}`, doc);
            }
        }
    }
    console.log(`  media lama terbaca: ${existingMedia.size} halaman`);

    let books = generateStaticBooks();

    for (const book of books) {
        const ref = catalog[book.subject_id];
        if (ref && ref.reference) {
            book.reference_link = ref.reference.link;
            book.reference_author = ref.reference.author;
            book.reference_title = ref.reference.title;
            book.reference_year = ref.reference.year;
        }
        const old = existingMedia.get(`${book.subject_id}|${book.kelas}|${book.page_number}`);
        if (old) {
            if (old.video_url) book.video_url = old.video_url;
            if (old.image_url) book.image_url = old.image_url;
        }
        // Catatan: image_url & video_url tidak lagi diisi saat seed.
        // Ilustrasi di-generate on-demand lewat /api/media/illustration/...,
        // video di-resolve lewat /api/media/video/... (lihat mediaService.js).
    }

    console.log(`  total halaman tergenerate: ${books.length}`);

    if (books.length === 0) {
        console.error('\nTidak ada halaman yang berhasil digenerate - data lama dibiarkan utuh.');
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log('\n=== 4. Tulis ke database ===');
    if (!KEEP_BOOKS) {
        await Book.deleteMany({});
        console.log('  buku lama dihapus');
    }
    await insertInBatches(books);
    console.log(`  ${books.length} halaman tersimpan`);

    // Ringkasan kualitas - ini yang jadi bukti, bukan asumsi.
    const stored = await Book.find({}).select('title paragraphs quiz_questions image_url reference_link video_url').lean();
    const titles = stored.map(b => b.title);
    const uniqueTitles = new Set(titles).size;
    const withImage = stored.filter(b => b.image_url && b.image_url.length > 10).length;
    const withRef = stored.filter(b => b.reference_link && !/kemendikdasmen/.test(b.reference_link)).length;
    const withVideo = stored.filter(b => b.video_url).length;
    const avgPar = (stored.reduce((a, b) => a + (b.paragraphs ? b.paragraphs.length : 0), 0) / stored.length).toFixed(1);
    const avgQuiz = (stored.reduce((a, b) => a + (b.quiz_questions ? b.quiz_questions.length : 0), 0) / stored.length).toFixed(1);
    const emptyPar = stored.filter(b => !b.paragraphs || b.paragraphs.length < 3).length;

    console.log('\n=== Ringkasan ===');
    console.log(`  halaman tersimpan      : ${stored.length}`);
    console.log(`  judul unik             : ${uniqueTitles} (${((uniqueTitles / stored.length) * 100).toFixed(1)}%)`);
    console.log(`  rata-rata paragraf     : ${avgPar}`);
    console.log(`  rata-rata soal kuis    : ${avgQuiz}`);
    console.log(`  halaman tanpa materi   : ${emptyPar}`);
    console.log(`  dengan gambar Commons  : ${withImage} (${((withImage / stored.length) * 100).toFixed(1)}%)`);
    console.log(`  dengan sumber Wikipedia: ${withRef} (${((withRef / stored.length) * 100).toFixed(1)}%)`);
    console.log(`  dengan video           : ${withVideo} (sengaja kosong)`);
    console.log(`\nSelesai dalam ${fmtDuration(Date.now() - t0)}`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
