const express = require('express');
const subjectController = require('../controllers/subject.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/available', authenticateToken, subjectController.getAvailableSubjects);
router.get('/all', authenticateToken, subjectController.getAllSubjects);
router.get('/:id', authenticateToken, subjectController.getSubject);

module.exports = router;
