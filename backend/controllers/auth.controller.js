const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, nama: user.nama, user_id: user.user_id, jenis_kelamin: user.jenis_kelamin, bio: user.bio || '', title: user.title || '' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

exports.googleCallback = async (req, res) => {
    try {
        const token = generateToken(req.user);
        const isNew = !req.user.profileComplete;
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/login.html?token=${token}${isNew ? '&new=1' : ''}`);
    } catch (err) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}/login.html?error=auth_failed`);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { nama, tanggal_lahir, kelas, semester, jenis_kelamin, bio, title } = req.body;
        if (!nama || !tanggal_lahir || !kelas || semester === undefined) {
            return res.status(400).json({ error: 'Semua field wajib diisi: nama, tanggal_lahir, kelas, semester.' });
        }

        const updateData = {
            nama: nama.trim(),
            tanggal_lahir: new Date(tanggal_lahir),
            kelas,
            semester: Number(semester),
            jenis_kelamin: jenis_kelamin || '',
            bio: typeof bio === 'string' ? bio.trim().slice(0, 50) : '',
            title: typeof title === 'string' ? title.trim() : '',
            profileComplete: true
        };

        if (req.file) {
            updateData.foto_profil = '/uploads/profiles/' + req.file.filename;
        }

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

        const token = generateToken(user);
        res.json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-__v');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
