const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subject_id: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    jenjang: { type: String, enum: ['sd', 'smp', 'sma', 'smk'], required: true },
    kategori: {
        type: String,
        enum: ['umum', 'agama', 'kejuruan', 'peminatan'],
        required: true
    },
    agama: {
        type: String,
        enum: ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'khonghucu'],
        default: null
    },
    jurusan: {
        type: String,
        enum: ['tkj', 'rpl', 'dkv', 'ak', 'otkp', 'bd', 'tkr', 'itl', 'tmo', 'perhotelan', 'tata_boga', 'tata_busana', 'keperawatan', 'farmasi', 'agribisnis',
            'pemesinan', 'pengelasan', 'otoronik', 'tsm', 'tkp', 'ditf', 'geomatika', 'tab', 'mekatronika', 'tei', 'tav', 'tki', 'tet', 'tata_kecantikan', 'upw',
            'seni_pertunjukan', 'animasi', 'broadcasting', 'kehutanan', 'ternak', 'perikanan', 'tphp', 'logistik', 'tlm', 'dental'],
        default: null
    },
    peminatan: {
        type: String,
        enum: ['mipa', 'ips', 'bahasa'],
        default: null
    },
    kelas_min: { type: Number, required: true },
    kelas_max: { type: Number, required: true },
    icon: { type: String, default: '📚' },
    deskripsi: { type: String, default: '' },
    aktif: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
