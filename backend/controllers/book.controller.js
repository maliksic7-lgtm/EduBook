const Book = require('../models/Book');

async function getBookPage(req, res) {
    try {
        const { subjectId, page } = req.params;
        const bookPage = await Book.findOne({
            subject_id: subjectId,
            page_number: Number(page)
        });
        if (!bookPage) return res.status(404).json({ message: 'Halaman tidak ditemukan' });
        res.json(bookPage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Frontend memanggil /book/subject/:subjectId/kelas/:kelas/:page — polyakan
// dengan kelas, karena satu subject bisa punya buku untuk beberapa kelas.
async function getBookPageByKelas(req, res) {
    try {
        const { subjectId, kelas, page } = req.params;
        const bookPage = await Book.findOne({
            subject_id: subjectId,
            kelas: Number(kelas),
            page_number: Number(page)
        });
        if (!bookPage) return res.status(404).json({ message: 'Halaman tidak ditemukan' });
        res.json(bookPage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getBooksBySubject(req, res) {
    try {
        const { subjectId } = req.params;
        const books = await Book.find({ subject_id: subjectId }).sort({ kelas: 1, page_number: 1 });
        res.json({ books });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getBooksBySubjectAndKelas(req, res) {
    try {
        const { subjectId, kelas } = req.params;
        const books = await Book.find({
            subject_id: subjectId,
            kelas: Number(kelas)
        }).sort({ page_number: 1 });
        res.json({ books });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createBookPage(req, res) {
    try {
        const {
            subject_id,
            jenjang,
            kelas,
            page_number,
            title,
            paragraphs,
            quiz_questions,
            image_url,
            reference_link,
            reference_author,
            reference_title,
            reference_year,
            video_url
        } = req.body;

        const pageNumber = Number(page_number);
        const kelasNum = Number(kelas);

        if (!subject_id || typeof subject_id !== 'string') {
            return res.status(400).json({ error: 'subject_id wajib diisi.' });
        }
        if (!jenjang || !['sd', 'smp', 'sma', 'smk'].includes(jenjang)) {
            return res.status(400).json({ error: 'jenjang tidak valid.' });
        }
        if (!Number.isInteger(kelasNum) || kelasNum < 1 || kelasNum > 12) {
            return res.status(400).json({ error: 'kelas harus berupa bilangan bulat 1-12.' });
        }
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
            subject_id,
            jenjang,
            kelas: kelasNum,
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
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Halaman ini sudah ada untuk mapel dan kelas tersebut.' });
        }
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getBookPage, getBookPageByKelas, getBooksBySubject, getBooksBySubjectAndKelas, createBookPage };
