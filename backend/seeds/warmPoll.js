// Fallback pengisi ilustrasi: Pollinations (turbo), serial dengan jeda ~1/45s.
require('dotenv').config();
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const mediaService = require('../services/mediaService');

const DIR = mediaService.ILLUSTRATION_DIR;
const STYLE = ' Educational textbook illustration, flat vector style, clean simple background, vibrant colors, no text, no letters, no watermark.';

function arg(name, def) {
    const p = process.argv.find(a => a.startsWith(`--${name}=`));
    return p ? p.split('=')[1] : def;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function sanitize(s) {
    return String(s || '').replace(/[^a-zA-Z0-9\s,.\-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}
function buildPrompt(book) {
    const tq = mediaService._diag.topicQuery(book);
    const topic = tq.queryPhrases.length ? tq.queryPhrases.join(', ') : sanitize(book.title);
    return `Educational illustration about ${topic}.` + STYLE;
}

async function genOne(book) {
    const prompt = buildPrompt(book);
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            const seed = Math.floor(Math.random() * 1000000);
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 1000))}?width=768&height=448&nologo=true&model=turbo&seed=${seed}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(120000) });
            if (r.status === 402 || r.status === 429) { await sleep(30000); continue; }
            if (!r.ok) { await sleep(10000); continue; }
            const buf = Buffer.from(await r.arrayBuffer());
            if (buf.length < 4000) { await sleep(10000); continue; }
            const base = `${book.subject_id}_k${book.kelas}_p${book.page_number}`;
            await fsp.writeFile(path.join(DIR, `${base}.jpg`), buf);
            await fsp.writeFile(path.join(DIR, `${base}.json`), JSON.stringify({
                credit: 'Ilustrasi AI (Pollinations)',
                source_url: 'https://pollinations.ai',
                source: 'ai'
            }, null, 1));
            try { await Book.updateOne({ _id: book._id }, { $set: { image_credit: 'Ilustrasi AI (Pollinations)', image_source_url: 'https://pollinations.ai' } }); } catch (e) {}
            return true;
        } catch (e) { await sleep(10000); }
    }
    return false;
}

(async () => {
    const limit = parseInt(arg('limit', '0')) || 0;
    const gap = Math.max(5000, parseInt(arg('gap', '35000')) || 35000);
    const reverse = process.argv.includes('--reverse');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');
    const books = await Book.find({}).select('subject_id kelas page_number title').lean();
    let todo = books.filter(b => !fs.existsSync(path.join(DIR, `${b.subject_id}_k${b.kelas}_p${b.page_number}.jpg`)));
    if (reverse) todo = todo.reverse();
    if (limit > 0) todo = todo.slice(0, limit);
    console.log(`Pollinations: perlu=${todo.length} gap=${gap}ms`);
    let ok = 0, fail = 0;
    const t0 = Date.now();
    for (let i = 0; i < todo.length; i++) {
        const got = await genOne(todo[i]);
        if (got) ok++; else fail++;
        const mins = ((Date.now() - t0) / 60000).toFixed(1);
        console.log(`[${i + 1}/${todo.length}] ${got ? 'ok' : 'GAGAL'} ${todo[i].subject_id} k${todo[i].kelas} p${todo[i].page_number} (${mins} menit)`);
        if (i < todo.length - 1) await sleep(gap);
    }
    console.log(`\nSelesai. ok=${ok} gagal=${fail} total=${todo.length} durasi=${((Date.now() - t0) / 60000).toFixed(1)} menit`);
    await mongoose.disconnect();
    process.exit(0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
