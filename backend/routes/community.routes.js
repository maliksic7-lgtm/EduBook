const express = require('express');
const router = express.Router();
const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { getAvailableSubjects } = require('../services/subjectAccess');

const rateMap = new Map();
const IMAGE_RE = /^\/uploads\/chat\/[\w.-]+$/;

function normalizeImage(value) {
    const v = String(value || '').trim();
    return IMAGE_RE.test(v) ? v : '';
}

function categoryLabel(kategori) {
    return { umum: 'Mapel Umum', agama: 'Pendidikan Agama', kejuruan: 'Mapel Jurusan', peminatan: 'Mapel Peminatan' }[kategori] || 'Mapel';
}

router.get('/', authenticateToken, async (req, res) => {
    try {
        const subjects = await getAvailableSubjects(req.user);
        const ids = subjects.map(s => s.subject_id);

        const [stats, userCounts] = await Promise.all([
            CommunityMessage.aggregate([
                { $match: { community_id: { $in: ids } } },
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: '$community_id',
                        message_count: { $sum: 1 },
                        members: { $addToSet: '$user_id' },
                        last_text: { $last: '$text' },
                        last_image: { $last: '$image' },
                        last_name: { $last: '$nama' },
                        last_at: { $last: '$createdAt' }
                    }
                }
            ]),
            User.aggregate([
                { $match: { profileComplete: true } },
                { $group: { _id: { jenjang: '$jenjang', agama: '$agama', jurusan: '$jurusan', peminatan: '$peminatan', kelas: '$kelas' }, n: { $sum: 1 } } }
            ])
        ]);

        const statMap = {};
        for (const s of stats) statMap[s._id] = s;

        function estimateMembers(subject) {
            let total = 0;
            for (const row of userCounts) {
                const g = row._id || {};
                if (g.jenjang !== subject.jenjang) continue;
                const kelas = Number(g.kelas) || 0;
                if (kelas && (kelas < subject.kelas_min || kelas > subject.kelas_max)) continue;
                if (subject.kategori === 'agama' && g.agama !== subject.agama) continue;
                if (subject.kategori === 'kejuruan' && g.jurusan !== subject.jurusan) continue;
                if (subject.kategori === 'peminatan' && g.peminatan !== subject.peminatan) continue;
                total += row.n;
            }
            return total;
        }

        const communities = subjects.map(subject => {
            const st = statMap[subject.subject_id] || {};
            return {
                community_id: subject.subject_id,
                nama: subject.nama,
                kategori: subject.kategori,
                kategori_label: categoryLabel(subject.kategori),
                icon: subject.icon || '📚',
                deskripsi: subject.deskripsi || '',
                jenjang: subject.jenjang,
                agama: subject.agama || null,
                jurusan: subject.jurusan || null,
                member_count: estimateMembers(subject),
                message_count: st.message_count || 0,
                active_members: (st.members || []).length,
                last_text: st.last_text || '',
                last_image: st.last_image || '',
                last_name: st.last_name || '',
                last_at: st.last_at || null
            };
        });

        res.json({ communities });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function resolveCommunity(req) {
    const subjects = await getAvailableSubjects(req.user);
    return subjects.find(s => s.subject_id === req.params.id) || null;
}

router.get('/:id/messages', authenticateToken, async (req, res) => {
    try {
        const subject = await resolveCommunity(req);
        if (!subject) {
            return res.status(403).json({ error: 'Komunitas ini tidak tersedia untuk jenjang/agama/jurusanmu.' });
        }
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 60, 1), 100);
        const filter = { community_id: subject.subject_id };
        if (req.query.before) {
            const before = new Date(req.query.before);
            if (!isNaN(before.getTime())) filter.createdAt = { $lt: before };
        }
        const rows = await CommunityMessage.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
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
            community: {
                community_id: subject.subject_id,
                nama: subject.nama,
                kategori: subject.kategori,
                icon: subject.icon || '📚',
                deskripsi: subject.deskripsi || ''
            },
            messages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/messages', authenticateToken, async (req, res) => {
    try {
        const subject = await resolveCommunity(req);
        if (!subject) {
            return res.status(403).json({ error: 'Komunitas ini tidak tersedia untuk jenjang/agama/jurusanmu.' });
        }
        const key = req.user.user_id + ':' + subject.subject_id;
        const last = rateMap.get(key) || 0;
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
            const original = await CommunityMessage.findById(replyId).lean();
            if (!original || original.community_id !== subject.subject_id) {
                return res.status(404).json({ error: 'Pesan yang dibalas tidak ditemukan di komunitas ini.' });
            }
            replyTo = {
                message_id: String(original._id),
                sender_id: original.user_id,
                nama: original.nama || 'Siswa',
                text: String(original.text || '').slice(0, 160),
                has_image: !!original.image
            };
        }
        rateMap.set(key, Date.now());

        const msg = await CommunityMessage.create({
            community_id: subject.subject_id,
            user_id: req.user.user_id,
            nama: req.user.nama,
            foto_profil: req.user.foto_profil || '',
            jenjang: req.user.jenjang || '',
            kelas: Number(req.user.kelas) || 0,
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
