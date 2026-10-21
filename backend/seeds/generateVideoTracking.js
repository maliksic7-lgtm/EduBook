require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const Subject = require('../models/Subject');

function escapeCSV(val) {
    const s = String(val || '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');
    console.log('Terhubung ke MongoDB');

    const subjects = await Subject.find().lean();
    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.subject_id] = s; });

    const books = await Book.find().sort({ jenjang: 1, subject_id: 1, kelas: 1, page_number: 1 }).lean();
    console.log(`Total halaman: ${books.length}`);

    const rows = [];
    rows.push(['subject_id', 'nama', 'jenjang', 'kelas', 'page_number', 'title', 'video_url', 'video_title', 'status'].join(','));

    for (const book of books) {
        const subject = subjectMap[book.subject_id] || {};
        rows.push([
            escapeCSV(book.subject_id),
            escapeCSV(subject.nama || ''),
            escapeCSV(book.jenjang),
            escapeCSV(book.kelas),
            escapeCSV(book.page_number),
            escapeCSV(book.title),
            '',
            '',
            ''
        ].join(','));
    }

    const outputPath = path.join(__dirname, 'video-tracking.csv');
    fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
    console.log(`CSV tersimpan: ${outputPath}`);
    console.log(`Total rows: ${rows.length - 1}`);

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
