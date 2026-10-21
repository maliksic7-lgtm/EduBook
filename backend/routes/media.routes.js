const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Subject = require('../models/Subject');
const mediaService = require('../services/mediaService');

const subjectNameCache = new Map();

async function getSubjectName(subjectId) {
    if (subjectNameCache.has(subjectId)) return subjectNameCache.get(subjectId);
    try {
        const s = await Subject.findOne({ subject_id: subjectId }).select('nama').lean();
        const name = s ? s.nama : subjectId;
        subjectNameCache.set(subjectId, name);
        return name;
    } catch (e) {
        return subjectId;
    }
}

async function loadBook(req) {
    const kelas = Number(req.params.kelas);
    const page = Number(req.params.page);
    if (!req.params.subjectId || !Number.isFinite(kelas) || !Number.isFinite(page)) return null;
    return Book.findOne({ subject_id: req.params.subjectId, kelas, page_number: page })
        .select('subject_id kelas page_number title paragraphs video_url video_title video_duration image_credit image_source_url')
        .lean();
}

// Ilustrasi halaman: cari gambar relevan saat pertama diminta, lalu di-cache ke disk.
// Fallback SVG cover (memuat judul) bila tidak ada gambar yang cocok.
router.get('/illustration/:subjectId/:kelas/:page', async (req, res) => {
    try {
        const book = await loadBook(req);
        if (!book) return res.status(404).end();
        const name = await getSubjectName(book.subject_id);
        const result = await mediaService.getIllustration(book, name);
        if (result && result.file) {
            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=604800');
            return res.sendFile(result.file);
        }
        res.set('Content-Type', 'image/svg+xml');
        res.set('Cache-Control', 'public, max-age=600');
        return res.send(mediaService.svgCover(book, name));
    } catch (e) {
        console.error('[media] illustration error:', e.message);
        res.status(500).end();
    }
});

// Info kredit gambar (untuk caption "Sumber gambar" di halaman buku).
router.get('/imageinfo/:subjectId/:kelas/:page', async (req, res) => {
    try {
        const book = await loadBook(req);
        if (!book) return res.status(404).json({});
        const meta = mediaService.readIllustrationMeta(book);
        if (meta) return res.json({ credit: meta.credit || '', source_url: meta.source_url || '' });
        if (book.image_credit) return res.json({ credit: book.image_credit, source_url: book.image_source_url || '' });
        res.json({});
    } catch (e) {
        res.json({});
    }
});

// Video pembelajaran halaman: resolusi via yt-dlp sekali, tersimpan di DB.
router.get('/video/:subjectId/:kelas/:page', async (req, res) => {
    try {
        const book = await loadBook(req);
        if (!book) return res.status(404).json({ video_url: '' });
        const name = await getSubjectName(book.subject_id);
        const result = await mediaService.resolveVideo(book, name);
        res.set('Cache-Control', 'no-store');
        res.json(result);
    } catch (e) {
        console.error('[media] video error:', e.message);
        res.json({ video_url: '' });
    }
});

module.exports = router;
