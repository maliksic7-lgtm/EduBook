const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.post('/device/keyword', deviceController.detectKeyword);
router.get('/device/info', deviceController.getDeviceInfo);

module.exports = router;
