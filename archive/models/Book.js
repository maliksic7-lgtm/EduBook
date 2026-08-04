const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    page_number: {
        type: Number,
        required: true,
        unique: true
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
        correct_answer: String
    }],
    image_url: {
        type: String,
        default: ''
    },
    reference_link: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Book', BookSchema);