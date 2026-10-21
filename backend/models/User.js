const mongoose = require('mongoose');
const crypto = require('crypto');

function generateUserId() {
    return 'EDU' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, lowercase: true },
    nama: { type: String, required: true },
    user_id: { type: String, unique: true, default: generateUserId },
    tanggal_lahir: { type: Date },
    kelas: { type: Number, min: 1, max: 12 },
    semester: { type: Number },
    jenis_kelamin: { type: String, enum: ['L', 'P', ''], default: '' },
    foto_profil: { type: String, default: '' },
    profileComplete: { type: Boolean, default: false },
    showcase_badges: { type: [String], default: [] },
    bio: { type: String, maxlength: 50, default: '' },
    last_active: { type: Date, default: null },
    title: { type: String, default: '' },
    favorite_subject_id: { type: String, default: '' },
    jenjang: { type: String, enum: ['sd', 'smp', 'sma', 'smk'], required: function() { return this.profileComplete === true; } },
    agama: { type: String, enum: ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'khonghucu'], required: function() { return this.profileComplete === true; } },
    jurusan: {
        type: String,
        enum: ['tkj', 'rpl', 'dkv', 'ak', 'otkp', 'bd', 'tkr', 'itl', 'tmo', 'perhotelan', 'tata_boga', 'tata_busana', 'keperawatan', 'farmasi', 'agribisnis',
            'pemesinan', 'pengelasan', 'otoronik', 'tsm', 'tkp', 'ditf', 'geomatika', 'tab', 'mekatronika', 'tei', 'tav', 'tki', 'tet', 'tata_kecantikan', 'upw',
            'seni_pertunjukan', 'animasi', 'broadcasting', 'kehutanan', 'ternak', 'perikanan', 'tphp', 'logistik', 'tlm', 'dental'],
        required: function() { return this.jenjang === 'smk'; }
    },
    peminatan: {
        type: String,
        enum: ['mipa', 'ips', 'bahasa'],
        required: function() { return this.jenjang === 'sma'; }
    },
    nama_sekolah: { type: String, required: function() { return this.profileComplete === true; }, trim: true },
    status_sekolah: { type: String, enum: ['negeri', 'swasta'], required: function() { return this.profileComplete === true; } },
    provinsi: { type: String, default: '' },
    kota: { type: String, default: '' },
    mapel_aktif: [{ type: String, default: [] }],
    game_xp: { type: Number, default: 0 },
    game_rating: { type: Number, default: 1000 },
    game_matches: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
