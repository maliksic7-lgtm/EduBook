const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
    student_name: {
        type: String,
        required: true,
        index: true
    },
    session_id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: 'Obrolan Baru'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'bot'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    message_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

ChatHistorySchema.index({ student_name: 1, updated_at: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);