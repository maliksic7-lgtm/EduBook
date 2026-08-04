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
    kelas: { type: String },
    semester: { type: Number },
    jenis_kelamin: { type: String, enum: ['L', 'P', ''], default: '' },
    foto_profil: { type: String, default: '' },
    profileComplete: { type: Boolean, default: false },
    showcase_badges: { type: [String], default: [] },
    bio: { type: String, maxlength: 50, default: '' },
    last_active: { type: Date, default: null },
    title: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
