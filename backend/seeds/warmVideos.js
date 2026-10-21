// Warm video: cari & simpan video YouTube untuk semua halaman yang belum punya.
// Pakai: node seeds/warmVideos.js [--parallel=3] [--subject=sd_bing] [--limit=100]
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const mediaService = require('../services/mediaService');

function arg(name, def) {
    const p = process.argv.find(a => a.startsWith(`--${name}=`));
    return p ? p.split('=')[1] : def;
}

(async () => {
    const parallel = Math.max(1, parseInt(arg('parallel', '3')) || 3);
    const onlySubject = arg('subject', '');
    const limit = parseInt(arg('limit', '0')) || 0;

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');

    const query = onlySubject ? { subject_id: onlySubject, video_url: '' } : { video_url: '' };
    let books = await Book.find(query).select('subject_id kelas page_number title').lean();
    if (limit > 0) books = books.slice(0, limit);

    const subjects = await Subject.find({}).select('subject_id nama').lean();
    const nameById = new Map(subjects.map(s => [s.subject_id, s.nama]));

    let done = 0, ok = 0, fail = 0;
    const t0 = Date.now();

    console.log(`Video: total=${books.length} perlu_dicari=${books.length} paralel=${parallel}`);

    let idx = 0;
    async function worker(wid) {
        while (idx < books.length) {
            const b = books[idx++];
            const name = nameById.get(b.subject_id) || b.subject_id;
            const r = await mediaService.resolveVideo(b, name);
            done++;
            if (r && r.video_url) {
                ok++;
                if (ok % 25 === 0) console.log(`  contoh: ${b.subject_id} k${b.kelas} p${b.page_number} -> ${r.video_title}`);
            } else fail++;
            if (done % 25 === 0 || done === books.length) {
                const mins = ((Date.now() - t0) / 60000).toFixed(1);
                console.log(`[${done}/${books.length}] ok=${ok} gagal=${fail} (${mins} menit)`);
            }
        }
    }

    await Promise.all(Array.from({ length: parallel }, (_, i) => worker(i)));

    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`\nSelesai. ok=${ok} gagal=${fail} total=${books.length} durasi=${mins} menit`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
