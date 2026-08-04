const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    student_name: {
        type: String,
        required: true,
        index: true
    },
    activity_type: {
        type: String,
        enum: ['hafalan', 'quiz', 'listening'],
        required: true,
        default: 'hafalan',
        index: true
    },
    current_page: {
        type: Number,
        required: true
    },
    paragraph_id: {
        type: Number
    },
    quiz_total_questions: {
        type: Number,
        min: 0
    },
    text_hafalan: {
        type: String,
        default: ''
    },
    duration_minutes: {
        type: Number,
        default: 0
    },
    hafalan_features: {
        is_submitted: {
            type: Boolean,
            default: false
        },
        feedback_text: {
            type: String,
            default: ''
        },
        score: {
            type: Number,
            default: 0
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

ActivitySchema.index({ student_name: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
