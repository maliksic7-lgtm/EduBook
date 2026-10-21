const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Album = require('../models/Album');
const ChatHistory = require('../models/ChatHistory');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Friendship = require('../models/Friendship');
const DailyQuest = require('../models/DailyQuest');
const GlobalMessage = require('../models/GlobalMessage');
const CommunityMessage = require('../models/CommunityMessage');
const GameResult = require('../models/GameResult');
const path = require('path');
const { publishToDevice, MQTT_TOPIC_CONFIG } = require('../services/mqttService');
const { validateSchoolName } = require('../utils/schoolValidator');
const { sanitizeTitle } = require('../services/titleService');

function generateToken(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            nama: user.nama,
            user_id: user.user_id,
            jenjang: user.jenjang,
            agama: user.agama,
            jurusan: user.jurusan,
            peminatan: user.peminatan,
            nama_sekolah: user.nama_sekolah,
            status_sekolah: user.status_sekolah,
            kelas: user.kelas,
            jenis_kelamin: user.jenis_kelamin,
            bio: user.bio || '',
            title: user.title || ''
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

exports.googleCallback = async (req, res) => {
    try {
        const token = generateToken(req.user);
        const isNew = !req.user.profileComplete;
        publishToDevice(MQTT_TOPIC_CONFIG, { student_name: req.user.nama || 'Siswa_EduBook', language: 'id' });
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/login.html?token=${token}${isNew ? '&new=1' : ''}`);
    } catch (err) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/login.html?error=auth_failed`);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
        const safeTitle = await sanitizeTitle(user);
        if (safeTitle !== (user.title || '')) user.title = safeTitle;
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const {
            nama,
            tanggal_lahir,
            kelas,
            semester,
            jenis_kelamin,
            bio,
            title,
            jenjang,
            agama,
            jurusan,
            peminatan,
            nama_sekolah,
            provinsi,
            kota
        } = req.body;

        if (!nama || !tanggal_lahir || !kelas || semester === undefined) {
            return res.status(400).json({ error: 'Field wajib: nama, tanggal_lahir, kelas, semester.' });
        }

        const existing = await User.findById(req.user.id);
        if (!existing) return res.status(404).json({ error: 'User tidak ditemukan.' });

        const finalJenjang = jenjang || existing.jenjang;
        const finalAgama = agama || existing.agama;
        const finalNamaSekolah = nama_sekolah || existing.nama_sekolah;
        const finalJurusan = (jurusan || existing.jurusan) || null;
        const finalPeminatan = (peminatan || existing.peminatan) || null;

        if (!finalJenjang || !finalAgama || !finalNamaSekolah) {
            return res.status(400).json({ error: 'Field wajib: jenjang, agama, nama_sekolah.' });
        }

        const schoolValidation = validateSchoolName(finalNamaSekolah);
        if (!schoolValidation.valid) {
            return res.status(400).json({ error: schoolValidation.error });
        }

        if (schoolValidation.jenjang !== finalJenjang) {
            return res.status(400).json({
                error: `Jenjang dari nama sekolah (${schoolValidation.jenjang}) tidak sesuai dengan pilihan jenjang (${finalJenjang})`
            });
        }

        if (finalJenjang === 'smk' && !finalJurusan) {
            return res.status(400).json({ error: 'Jurusan wajib dipilih untuk jenjang SMK.' });
        }

        if (finalJenjang === 'sma' && !finalPeminatan) {
            return res.status(400).json({ error: 'Peminatan wajib dipilih untuk jenjang SMA.' });
        }

        const kelasNum = Number(kelas);
        if (finalJenjang === 'sd' && (kelasNum < 1 || kelasNum > 6)) {
            return res.status(400).json({ error: 'Kelas SD harus 1-6.' });
        }
        if (finalJenjang === 'smp' && (kelasNum < 7 || kelasNum > 9)) {
            return res.status(400).json({ error: 'Kelas SMP harus 7-9.' });
        }
        if ((finalJenjang === 'sma' || finalJenjang === 'smk') && (kelasNum < 10 || kelasNum > 12)) {
            return res.status(400).json({ error: 'Kelas SMA/SMK harus 10-12.' });
        }

        const updateData = {
            nama: nama.trim(),
            tanggal_lahir: new Date(tanggal_lahir),
            kelas: kelasNum,
            semester: Number(semester),
            jenjang: finalJenjang,
            agama: finalAgama,
            jurusan: finalJenjang === 'smk' ? finalJurusan : null,
            peminatan: finalJenjang === 'sma' ? finalPeminatan : null,
            nama_sekolah: schoolValidation.normalized,
            status_sekolah: schoolValidation.status,
            jenis_kelamin: jenis_kelamin || '',
            bio: typeof bio === 'string' ? bio.trim().slice(0, 50) : '',
            title: existing.title || '',
            profileComplete: true
        };
        if (typeof provinsi === 'string') updateData.provinsi = provinsi.trim();
        if (typeof kota === 'string') updateData.kota = kota.trim();

        if (req.file) {
            updateData.foto_profil = '/uploads/profiles/' + req.file.filename;
        }

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
        const safeTitle = await sanitizeTitle(user);
        if (safeTitle !== (user.title || '')) user.title = safeTitle;

        const token = generateToken(user);
        publishToDevice(MQTT_TOPIC_CONFIG, { student_name: user.nama, language: 'id' });
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMapelAktif = async (req, res) => {
    try {
        const { mapel_aktif } = req.body;
        if (!Array.isArray(mapel_aktif)) {
            return res.status(400).json({ error: 'mapel_aktif harus berupa array.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { mapel_aktif },
            { new: true }
        ).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
        const safeTitle = await sanitizeTitle(user);
        if (safeTitle !== (user.title || '')) user.title = safeTitle;
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

        const uid = user.user_id;
        const nama = user.nama;

        const tryUnlink = (url) => {
            try {
                if (!url) return;
                const filePath = path.join(__dirname, '..', url.replace(/^\//, ''));
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (e) { /* abaikan */ }
        };

        tryUnlink(user.foto_profil);

        const albums = await Album.find({ user_id: uid }).select('url').lean();
        albums.forEach(a => tryUnlink(a.url));

        await Promise.all([
            Album.deleteMany({ user_id: uid }),
            Activity.deleteMany({ student_name: nama }),
            ChatHistory.deleteMany({ student_name: nama }),
            DailyQuest.deleteMany({ student_name: nama }),
            Message.deleteMany({ $or: [{ sender_id: uid }, { receiver_id: uid }] }),
            Notification.deleteMany({ $or: [{ user_id: uid }, { from_user_id: uid }] }),
            Friendship.deleteMany({ $or: [{ follower: uid }, { following: uid }] }),
            GlobalMessage.deleteMany({ user_id: uid }),
            CommunityMessage.deleteMany({ user_id: uid }),
            GameResult.deleteMany({ user_id: uid })
        ]);

        await User.deleteOne({ _id: user._id });

        res.json({ ok: true, message: 'Akun berhasil dihapus.' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: err.message });
    }
};
