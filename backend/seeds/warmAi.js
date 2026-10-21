// Isi ilustrasi halaman yang tidak ada di sumber gratis memakai AI (Stable Horde, gratis, paralel).
// Hasil disimpan ke cache disk yang sama dengan pipeline Wikipedia.
require('dotenv').config();
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const mediaService = require('../services/mediaService');

const DIR = mediaService.ILLUSTRATION_DIR;
const GEN = 'https://stablehorde.net/api/v2/generate/async';
const CHECK = 'https://stablehorde.net/api/v2/generate/check/';
const STATUS = 'https://stablehorde.net/api/v2/generate/status/';
const STYLE = ' Educational textbook illustration, flat vector style, clean simple background, vibrant colors, no text, no letters, no watermark.';

function arg(name, def) {
    const p = process.argv.find(a => a.startsWith(`--${name}=`));
    return p ? p.split('=')[1] : def;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function sanitize(s) {
    return String(s || '').replace(/[^a-zA-Z0-9\s,.\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function buildPrompt(book, subjectName) {
    const tq = mediaService._diag.topicQuery(book);
    const topic = tq.queryPhrases.length ? tq.queryPhrases.join(', ') : sanitize(book.title);
    return `Educational illustration about ${topic}.` + STYLE;
}

async function submitJob(prompt) {
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            const r = await fetch(GEN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' },
                body: JSON.stringify({ prompt, params: { width: 768, height: 448, steps: 20, n: 1 }, nsfw: false, censor_nsfw: true })
            });
            if (r.status === 429 || r.status === 503) { await sleep(10000 + Math.floor(Math.random() * 15000)); continue; }
            const j = await r.json();
            if (j.id) return j.id;
            await sleep(8000 * attempt);
        } catch (e) {
            await sleep(8000 * attempt);
        }
    }
    return null;
}

async function generateOne(book, subjectName) {
    const prompt = buildPrompt(book, subjectName);
    await sleep(1000 + Math.floor(Math.random() * 7000));
    const id = await submitJob(prompt);
    if (!id) return null;
    const t0 = Date.now();
    while (Date.now() - t0 < 300000) {
        await sleep(5000);
        try {
            const c = await (await fetch(CHECK + id)).json();
            if (c.done) {
                const s = await (await fetch(STATUS + id)).json();
                const g = s.generations && s.generations[0];
                if (!g || !g.img) return null;
                const r = await fetch(g.img);
                if (!r.ok) return null;
                const buf = Buffer.from(await r.arrayBuffer());
                if (buf.length < 4000) return null;
                const file = path.join(DIR, `${book.subject_id}_k${book.kelas}_p${book.page_number}.jpg`);
                await fsp.writeFile(file, buf);
                await fsp.writeFile(path.join(DIR, `${book.subject_id}_k${book.kelas}_p${book.page_number}.json`), JSON.stringify({
                    credit: 'Ilustrasi AI (Stable Horde)',
                    source_url: 'https://stablehorde.net',
                    source: 'ai'
                }, null, 1));
                try { await Book.updateOne({ _id: book._id }, { $set: { image_credit: 'Ilustrasi AI (Stable Horde)', image_source_url: 'https://stablehorde.net' } }); } catch (e) {}
                return file;
            }
            if (c.faulted) return null;
        } catch (e) { /* lanjut poll */ }
    }
    return null;
}

(async () => {
    const parallel = Math.max(1, parseInt(arg('parallel', '6')) || 6);
    const limit = parseInt(arg('limit', '0')) || 0;
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');

    const books = await Book.find({}).select('subject_id kelas page_number title').lean();
    const subjects = await Subject.find({}).select('subject_id nama').lean();
    const nameById = new Map(subjects.map(s => [s.subject_id, s.nama]));
    let todo = books.filter(b => !fs.existsSync(path.join(DIR, `${b.subject_id}_k${b.kelas}_p${b.page_number}.jpg`)));
    if (limit > 0) todo = todo.slice(0, limit);

    console.log(`AI ilustrasi: perlu=${todo.length} paralel=${parallel}`);
    let idx = 0, done = 0, ok = 0, fail = 0;
    const t0 = Date.now();

    async function worker() {
        while (idx < todo.length) {
            const b = todo[idx++];
            const name = nameById.get(b.subject_id) || b.subject_id;
            const file = await generateOne(b, name);
            done++;
            if (file) ok++; else fail++;
            if (done % 10 === 0 || done === todo.length) {
                const mins = ((Date.now() - t0) / 60000).toFixed(1);
                console.log(`[${done}/${todo.length}] ok=${ok} gagal=${fail} (${mins} menit)`);
            }
        }
    }
    await Promise.all(Array.from({ length: parallel }, () => worker()));
    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`\nSelesai. ok=${ok} gagal=${fail} total=${todo.length} durasi=${mins} menit`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
