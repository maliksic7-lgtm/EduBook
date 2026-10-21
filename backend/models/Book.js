const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    subject_id: {
        type: String,
        required: true,
        index: true
    },
    jenjang: {
        type: String,
        enum: ['sd', 'smp', 'sma', 'smk'],
        required: true
    },
    kelas: {
        type: Number,
        required: true
    },
    page_number: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    paragraphs: [{
        paragraph_id: Number,
        text: String
    }],
    quiz_questions: [{
        question: String,
        options: [String],
        correct_answer: String,
        question_type: { type: String, default: 'mcq' }
    }],
    listening_questions: [{
        question: String,
        options: [String],
        correct_answer: String,
        question_type: { type: String, default: 'listening_mcq' }
    }],
    image_url: {
        type: String,
        default: ''
    },
    reference_link: {
        type: String,
        default: ''
    },
    reference_author: {
        type: String,
        default: ''
    },
    reference_title: {
        type: String,
        default: ''
    },
    reference_year: {
        type: String,
        default: ''
    },
    video_url: {
        type: String,
        default: ''
    },
    video_title: {
        type: String,
        default: ''
    },
    video_duration: {
        type: Number,
        default: 0
    },
    image_credit: {
        type: String,
        default: ''
    },
    image_source_url: {
        type: String,
        default: ''
    }
});

BookSchema.index({ subject_id: 1, kelas: 1, page_number: 1 }, { unique: true });

module.exports = mongoose.model('Book', BookSchema);
