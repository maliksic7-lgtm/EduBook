const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        if (req.headers.accept?.includes('text/event-stream')) {
            req.user = null;
            return next();
        }
        return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        User.updateOne({ _id: decoded.id }, { last_active: new Date() }).catch(() => {});
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
}

module.exports = { authenticateToken, optionalAuth };
