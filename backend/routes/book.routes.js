const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const requireAdminKey = require('../middleware/requireAdminKey');
const { authenticateToken } = require('../middleware/auth');

router.get('/subject/:subjectId', authenticateToken, bookController.getBooksBySubject);
router.get('/subject/:subjectId/kelas/:kelas', authenticateToken, bookController.getBooksBySubjectAndKelas);
router.get('/subject/:subjectId/kelas/:kelas/:page', authenticateToken, bookController.getBookPageByKelas);
router.get('/subject/:subjectId/:page', authenticateToken, bookController.getBookPage);

router.post('/', requireAdminKey, bookController.createBookPage);

module.exports = router;
