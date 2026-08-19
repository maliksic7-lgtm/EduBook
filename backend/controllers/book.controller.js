const Book = require('../models/Book');

async function getBookPage(req, res) {
    try {
        const bookPage = await Book.findOne({ page_number: Number(req.params.page) });
        if (!bookPage) return res.status(404).json({ message: 'Halaman tidak ditemukan' });
        res.json(bookPage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createBookPage(req, res) {
    try {
        const { page_number, title, paragraphs, quiz_questions, image_url, reference_link, reference_author, reference_title, reference_year, video_url } = req.body;
        const pageNumber = Number(page_number);

        if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 10) {
            return res.status(400).json({ error: 'page_number harus berupa bilangan bulat 1-10.' });
        }
        if (typeof title !== 'string' || title.trim().length < 1 || title.length > 200) {
            return res.status(400).json({ error: 'title wajib diisi dan maksimal 200 karakter.' });
        }
        if (paragraphs !== undefined && (!Array.isArray(paragraphs) || paragraphs.length > 20)) {
            return res.status(400).json({ error: 'paragraphs tidak valid.' });
        }
        if (quiz_questions !== undefined && (!Array.isArray(quiz_questions) || quiz_questions.length > 100)) {
            return res.status(400).json({ error: 'quiz_questions tidak valid.' });
        }

        const newPage = new Book({
            page_number: pageNumber,
            title: title.trim(),
            paragraphs,
            quiz_questions,
            image_url,
            reference_link,
            reference_author,
            reference_title,
            reference_year,
            video_url
        });
        const savedPage = await newPage.save();
        res.status(201).json(savedPage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getBookPage, createBookPage };
