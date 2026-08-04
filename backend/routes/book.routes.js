const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const requireAdminKey = require('../middleware/requireAdminKey');

router.get('/:page', bookController.getBookPage);
router.post('/', requireAdminKey, bookController.createBookPage);

module.exports = router;
