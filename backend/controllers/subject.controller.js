const Subject = require('../models/Subject');
const { getAvailableSubjects } = require('../services/subjectAccess');

exports.getAvailableSubjects = async (req, res) => {
    try {
        const subjects = await getAvailableSubjects(req.user);
        res.json({ subjects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.findOne({ subject_id: req.params.id });
        if (!subject) return res.status(404).json({ error: 'Mapel tidak ditemukan.' });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ aktif: true }).sort({ jenjang: 1, kategori: 1, nama: 1 });
        res.json({ subjects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
