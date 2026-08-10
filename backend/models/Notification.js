const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['follow', 'achievement', 'streak_reminder', 'quest_reminder', 'fun', 'message'],
        required: true
    },
    from_user_id: { type: String, default: '' },
    from_user_name: { type: String, default: '' },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
