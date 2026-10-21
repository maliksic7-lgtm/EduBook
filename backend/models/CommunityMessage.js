const mongoose = require('mongoose');

const CommunityMessageSchema = new mongoose.Schema({
    community_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    nama: { type: String, required: true },
    foto_profil: { type: String, default: '' },
    jenjang: { type: String, default: '' },
    kelas: { type: Number, default: 0 },
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

CommunityMessageSchema.index({ community_id: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityMessage', CommunityMessageSchema);
