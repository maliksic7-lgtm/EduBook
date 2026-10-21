const express = require('express');
const router = express.Router();
const GlobalMessage = require('../models/GlobalMessage');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const onlineMap = new Map();
const rateMap = new Map();
const IMAGE_RE = /^\/uploads\/chat\/[\w.-]+$/;

function touchOnline(userId) {
    onlineMap.set(userId, Date.now());
    if (onlineMap.size > 5000) {
        const cutoff = Date.now() - 120000;
        for (const [id, ts] of onlineMap) if (ts < cutoff) onlineMap.delete(id);
    }
}

function onlineCount() {
    const cutoff = Date.now() - 90000;
    let n = 0;
    for (const ts of onlineMap.values()) if (ts >= cutoff) n++;
    return n;
}

function normalizeImage(value) {
    const v = String(value || '').trim();
    return IMAGE_RE.test(v) ? v : '';
}

router.get('/global-chat/messages', authenticateToken, async (req, res) => {
    try {
        touchOnline(req.user.user_id);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 60, 1), 100);
        const filter = {};
        if (req.query.before) {
            const before = new Date(req.query.before);
            if (!isNaN(before.getTime())) filter.createdAt = { $lt: before };
        }
        const rows = await GlobalMessage.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
        const ids = [...new Set(rows.map(r => r.user_id))];
        const users = ids.length
            ? await User.find({ user_id: { $in: ids } }).select('user_id foto_profil').lean()
            : [];
        const photoMap = {};
        users.forEach(u => { photoMap[u.user_id] = u.foto_profil || ''; });
        const messages = rows.reverse().map(m => ({
            ...m,
            foto_profil: photoMap[m.user_id] || m.foto_profil || ''
        }));
        res.json({
            messages,
            online: onlineCount()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/global-chat/messages', authenticateToken, async (req, res) => {
    try {
        const last = rateMap.get(req.user.user_id) || 0;
        if (Date.now() - last < 800) {
            return res.status(429).json({ error: 'Pelan-pelan ya, tunggu sebentar sebelum mengirim lagi.' });
        }
        const text = String(req.body.text || '').replace(/\s+/g, ' ').trim().slice(0, 500);
        const image = normalizeImage(req.body.image);
        if (!text && !image) {
            return res.status(400).json({ error: 'Pesan atau gambar tidak boleh kosong.' });
        }
        let replyTo = null;
        if (req.body.reply_to_id) {
            const replyId = String(req.body.reply_to_id).trim();
            if (!/^[a-f0-9]{24}$/i.test(replyId)) {
                return res.status(400).json({ error: 'Pesan yang dibalas tidak valid.' });
            }
            const original = await GlobalMessage.findById(replyId).lean();
            if (!original) {
                return res.status(404).json({ error: 'Pesan yang dibalas tidak ditemukan.' });
            }
            replyTo = {
                message_id: String(original._id),
                sender_id: original.user_id,
                nama: original.nama || 'Siswa',
                text: String(original.text || '').slice(0, 160),
                has_image: !!original.image
            };
        }
        rateMap.set(req.user.user_id, Date.now());
        touchOnline(req.user.user_id);

        const msg = await GlobalMessage.create({
            user_id: req.user.user_id,
            nama: req.user.nama,
            foto_profil: req.user.foto_profil || '',
            jenjang: req.user.jenjang || '',
            kelas: Number(req.user.kelas) || 0,
            nama_sekolah: req.user.nama_sekolah || '',
            text,
            image,
            reply_to: replyTo
        });
        res.status(201).json({ message: msg });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
