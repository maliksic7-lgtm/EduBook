const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Album = require('../models/Album');
const { authenticateToken } = require('../middleware/auth');

const albumDir = path.join(__dirname, '..', 'uploads', 'albums');
if (!fs.existsSync(albumDir)) {
    fs.mkdirSync(albumDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, albumDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `album-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.'));
    }
};

const uploadAlbum = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

function getUserId(req) {
    return req.user?.user_id || '';
}

router.post('/upload', authenticateToken, uploadAlbum.single('photo'), async (req, res) => {
    try {
        const me = getUserId(req);
        if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload.' });

        const photo = await Album.create({
            user_id: me,
            nama: req.body.nama || '',
            url: '/uploads/albums/' + req.file.filename
        });
        res.json({ ok: true, photo });
    } catch (err) {
        console.error('Album upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/list/:userId', authenticateToken, async (req, res) => {
    try {
        const photos = await Album.find({ user_id: req.params.userId }).sort({ created_at: -1 });
        res.json(photos);
    } catch (err) {
        console.error('Album list error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const photo = await Album.findById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Foto tidak ditemukan' });
        if (photo.user_id !== me) return res.status(403).json({ error: 'Bukan foto milikmu' });

        const filePath = path.join(__dirname, '..', photo.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Album.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        console.error('Album delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
