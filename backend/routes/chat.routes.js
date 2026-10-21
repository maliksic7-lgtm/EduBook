const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatController = require('../controllers/chat.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const chatDir = path.join(__dirname, '..', 'uploads', 'chat');
if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, chatDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.'));
};

const uploadChat = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', authenticateToken, uploadChat.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload.' });
    res.json({ ok: true, url: '/uploads/chat/' + req.file.filename });
});

router.get('/sessions/:student_name', optionalAuth, chatController.getChatSessions);
router.get('/session/:student_name/:session_id', optionalAuth, chatController.getChatSession);
router.post('/session', authenticateToken, chatController.createChatSession);
router.delete('/session/:student_name/:session_id', authenticateToken, chatController.deleteChatSession);
router.post('/message', authenticateToken, chatController.sendChatMessage);

module.exports = router;
