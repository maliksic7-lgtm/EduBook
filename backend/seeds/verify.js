require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook').then(async () => {
    const sample = await Book.findOne({ subject_id: 'sd_ppkn', kelas: 1, page_number: 1 }).lean();
    console.log('quiz_questions:', sample.quiz_questions?.length);
    console.log('listening_questions:', sample.listening_questions?.length);

    const total = await Book.countDocuments();
    const withListening = await Book.countDocuments({ listening_questions: { $exists: true, $ne: [] } });
    const with200 = await Book.countDocuments({ listening_questions: { $size: 200 } });
    console.log('Total halaman:', total);
    console.log('Dengan listening_questions:', withListening);
    console.log('Dengan 200 listening_questions:', with200);

    await mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
