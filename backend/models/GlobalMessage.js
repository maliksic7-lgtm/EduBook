const mongoose = require('mongoose');

const GlobalMessageSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true },
    nama: { type: String, required: true },
    foto_profil: { type: String, default: '' },
    jenjang: { type: String, default: '' },
    kelas: { type: Number, default: 0 },
    nama_sekolah: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' },
    reply_to: {
        message_id: { type: String, default: '' },
        sender_id: { type: String, default: '' },
        nama: { type: String, default: '' },
        text: { type: String, default: '' },
        has_image: { type: Boolean, default: false }
    }
}, { timestamps: true });

GlobalMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GlobalMessage', GlobalMessageSchema);
