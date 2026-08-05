require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { initMqttService } = require('./services/mqttService');
require('./config/passport');

const bookRoutes = require('./routes/book.routes');
const activityRoutes = require('./routes/activity.routes');
const chatRoutes = require('./routes/chat.routes');
const explainRoutes = require('./routes/explain.routes');
const cacheRoutes = require('./routes/cache.routes');
const streamRoutes = require('./routes/stream.routes');
const deviceRoutes = require('./routes/device.routes');
const authRoutes = require('./routes/auth.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const dailyQuestRoutes = require('./routes/dailyQuest.routes');
const socialRoutes = require('./routes/social.routes');
const albumRoutes = require('./routes/album.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const allowNullOrigin = process.env.CORS_ALLOW_NULL_ORIGIN !== 'false';

function isOriginAllowed(origin) {
    if (!origin || allowedOrigins.includes(origin) || (origin === 'null' && allowNullOrigin)) {
        return true;
    }

    // Wildcard subdomain: izinkan semua domain *.netlify.app (mis. https://x.netlify.app)
    if (/^https:\/\/([a-z0-9-]+)\.netlify\.app$/i.test(origin)) {
        return true;
    }

    return false;
}

app.use(cors({
    origin(origin, callback) {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin tidak diizinkan oleh konfigurasi CORS.'));
    }
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'edubook-sic-batch8-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

connectDB();
initMqttService();

app.use('/api/auth', authRoutes);
app.use('/api/book', bookRoutes);
app.use('/api', activityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', explainRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api', deviceRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', dailyQuestRoutes);
app.use('/api', socialRoutes);
app.use('/api/album', albumRoutes);

app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Ukuran file terlalu besar. Maksimal 2MB.' });
    }
    if (err.message?.includes('Format file')) {
        return res.status(400).json({ error: err.message });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Terjadi kesalahan internal server'
    });
});

app.listen(PORT, () => console.log(`🚀 Web Server berjalan di http://localhost:${PORT}`));
