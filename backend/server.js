require('dotenv').config({ path: require('path').join(__dirname, '.env') });

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const http = require('http');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

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
const subjectRoutes = require('./routes/subject.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const dailyQuestRoutes = require('./routes/dailyQuest.routes');
const socialRoutes = require('./routes/social.routes');
const albumRoutes = require('./routes/album.routes');
const mediaRoutes = require('./routes/media.routes');
const regionRoutes = require('./routes/region.routes');
const globalRoutes = require('./routes/global.routes');
const communityRoutes = require('./routes/community.routes');
const eduplayRoutes = require('./routes/eduplay.routes');
const { attachEduplay } = require('./services/eduplayService');
const { attachEduTest } = require('./services/edutestService');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Respons API selalu dinamis. Tanpa ini Express mengirim header ETag, browser
// menyimpan respons lalu mengvalidasi ulang dengan If-None-Match dan menerima
// 304 Not Modified — yang frontend perlakukan sebagai kegagalan karena
// response.ok hanya true untuk status 2xx.
app.set('etag', false);

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

// Jangan pernah meng-cache respons API di browser (lihat catatan ETag di atas).
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

connectDB();
initMqttService();

app.use('/api/auth', authRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/subjects', subjectRoutes);
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
app.use('/api/media', mediaRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api', globalRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/eduplay', eduplayRoutes);

// Semua endpoint /api/* yang tidak dikenal → JSON (bukan HTML 404 Express)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route tidak ditemukan.' });
});

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

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            if (isOriginAllowed(origin)) return callback(null, true);
            return callback(new Error('Origin tidak diizinkan oleh konfigurasi CORS.'));
        },
        methods: ['GET', 'POST']
    }
});
attachEduplay(io);
attachEduTest(io);

server.listen(PORT, () => console.log(`🚀 Web Server berjalan di http://localhost:${PORT}`));
setInterval(() => {
    const used = process.memoryUsage();
    console.log(`📊 Memory: RSS=${Math.round(used.rss / 1024 / 1024)}MB | Heap=${Math.round(used.heapUsed / 1024 / 1024)}MB | External=${Math.round(used.external / 1024 / 1024)}MB`);
}, 60000);
