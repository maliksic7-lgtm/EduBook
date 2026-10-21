const Subject = require('../models/Subject');

function subjectMatchesUser(subject, user) {
    if (!subject || !user) return false;
    if (subject.jenjang !== user.jenjang) return false;
    const kelas = Number(user.kelas) || 0;
    if (kelas < subject.kelas_min || kelas > subject.kelas_max) return false;
    if (subject.kategori === 'agama') return subject.agama === user.agama;
    if (subject.kategori === 'kejuruan') return subject.jurusan === user.jurusan;
    if (subject.kategori === 'peminatan') return subject.peminatan === user.peminatan;
    return true;
}

async function getAvailableSubjects(user) {
    const kelas = Number(user.kelas) || 1;
    const subjects = await Subject.find({
        jenjang: user.jenjang,
        aktif: true,
        kelas_min: { $lte: kelas },
        kelas_max: { $gte: kelas }
    }).sort({ kategori: 1, nama: 1 });

    return subjects.filter(s => {
        if (s.kategori === 'agama') return s.agama === user.agama;
        if (s.kategori === 'kejuruan') return s.jurusan === user.jurusan;
        if (s.kategori === 'peminatan') return s.peminatan === user.peminatan;
        return true;
    });
}

module.exports = { getAvailableSubjects, subjectMatchesUser };
