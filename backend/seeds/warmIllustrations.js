// Warm ilustrasi: generate AI untuk semua halaman buku yang belum ada gambarnya.
// Pakai: node seeds/warmIllustrations.js [--parallel=2] [--subject=sd_bing] [--limit=100]
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const mediaService = require('../services/mediaService');

function arg(name, def) {
    const p = process.argv.find(a => a.startsWith(`--${name}=`));
    return p ? p.split('=')[1] : def;
}

(async () => {
    const parallel = Math.max(1, parseInt(arg('parallel', '2')) || 2);
    const onlySubject = arg('subject', '');
    const subjectRegex = arg('regex', '');
    const prefixList = arg('prefix', '');
    const limit = parseInt(arg('limit', '0')) || 0;

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');

    let query = {};
    if (prefixList) {
        const prefixes = prefixList.split(',').map(s => s.trim()).filter(Boolean).map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        query = { subject_id: { $regex: '^(' + prefixes.join('|') + ')' } };
    } else if (subjectRegex) {
        query = { subject_id: { $regex: subjectRegex } };
    } else if (onlySubject) {
        query = { subject_id: onlySubject };
    }
    let books = await Book.find(query).select('subject_id kelas page_number title paragraphs').lean();
    if (limit > 0) books = books.slice(0, limit);

    const subjects = await Subject.find({}).select('subject_id nama').lean();
    const nameById = new Map(subjects.map(s => [s.subject_id, s.nama]));

    const shard = Math.max(0, parseInt(arg('shard', '0')) || 0);
    const shards = Math.max(1, parseInt(arg('shards', '1')) || 1);
    const todoAll = books.filter(b => !fs.existsSync(path.join(mediaService.ILLUSTRATION_DIR, `${b.subject_id}_k${b.kelas}_p${b.page_number}.jpg`)));
    const todo = todoAll.filter((_, i) => i % shards === shard);
    let done = 0, ok = 0, fail = 0;
    const t0 = Date.now();

    console.log(`Ilustrasi: total=${books.length} perlu_dibuat=${todo.length} paralel=${parallel}`);

    let idx = 0;
    async function worker(wid) {
        while (idx < todo.length) {
            const b = todo[idx++];
            const name = nameById.get(b.subject_id) || b.subject_id;
            const file = await mediaService.getIllustration(b, name);
            done++;
            if (file) ok++; else fail++;
            if (done % 25 === 0 || done === todo.length) {
                const mins = ((Date.now() - t0) / 60000).toFixed(1);
                console.log(`[${done}/${todo.length}] ok=${ok} gagal=${fail} (${mins} menit)`);
            }
        }
    }

    await Promise.all(Array.from({ length: parallel }, (_, i) => worker(i)));

    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`\nSelesai. ok=${ok} gagal=${fail} total=${todo.length} durasi=${mins} menit`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
