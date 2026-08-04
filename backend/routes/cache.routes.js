const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cache.controller');
const requireAdminKey = require('../middleware/requireAdminKey');

router.get('/status', cacheController.getCacheStatus);
router.post('/refresh', requireAdminKey, cacheController.refreshCache);
router.delete('/clear', requireAdminKey, cacheController.clearCache);

module.exports = router;
