const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/sessions/:student_name', optionalAuth, chatController.getChatSessions);
router.get('/session/:student_name/:session_id', optionalAuth, chatController.getChatSession);
router.post('/session', authenticateToken, chatController.createChatSession);
router.delete('/session/:student_name/:session_id', authenticateToken, chatController.deleteChatSession);
router.post('/message', authenticateToken, chatController.sendChatMessage);

module.exports = router;
