const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender_id: { type: String, required: true, index: true },
    sender_name: { type: String, default: '' },
    receiver_id: { type: String, required: true, index: true },
    text: { type: String, required: true },
    image: { type: String, default: '' },
    reply_to: {
        message_id: { type: String, default: '' },
        sender_id: { type: String, default: '' },
        nama: { type: String, default: '' },
        text: { type: String, default: '' },
        has_image: { type: Boolean, default: false }
    },
    read: { type: Boolean, default: false }
}, { timestamps: true });

MessageSchema.index({ sender_id: 1, receiver_id: 1, createdAt: 1 });
MessageSchema.index({ receiver_id: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
