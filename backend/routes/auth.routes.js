const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: '/login.html?error=google_auth_failed'
}), authController.googleCallback);

router.get('/profile', authenticateToken, authController.getProfile);

router.put('/profile', authenticateToken, upload.single('foto_profil'), authController.updateProfile);

router.get('/me', authenticateToken, authController.me);

module.exports = router;
