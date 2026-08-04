const express = require('express');
const router = express.Router();
const explainController = require('../controllers/explain.controller');

router.post('/explain', explainController.explainText);
router.post('/ai/content-insight', explainController.contentInsightRedirect);

module.exports = router;
