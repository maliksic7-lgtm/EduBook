const aiService = require('../services/aiService');

async function detectKeyword(req, res) {
    try {
        const { audio_text } = req.body;
        if (!audio_text) {
            return res.status(400).json({ message: 'audio_text diperlukan' });
        }

        const textLower = audio_text.toLowerCase().trim();
        let keyword = 'unknown';
        let confidence = 0;

        if (textLower.includes('iya') || textLower.includes('ya') || textLower.includes('yes') || textLower.includes('betul')) {
            keyword = 'iya';
            confidence = 0.9;
        } else if (textLower.includes('tidak') || textLower.includes('nggak') || textLower.includes('no') || textLower.includes('kagak')) {
            keyword = 'tidak';
            confidence = 0.9;
        } else if (textLower.includes('satu') || textLower.includes('menu 1') || textLower.includes('review')) {
            keyword = 'smart_review';
            confidence = 0.8;
        } else if (textLower.includes('dua') || textLower.includes('menu 2') || textLower.includes('kuis')) {
            keyword = 'quiz';
            confidence = 0.8;
        } else if (textLower.includes('tiga') || textLower.includes('menu 3') || textLower.includes('edubot')) {
            keyword = 'chat';
            confidence = 0.8;
        } else if (textLower.includes('empat') || textLower.includes('menu 4') || textLower.includes('baca') || textLower.includes('materi')) {
            keyword = 'baca';
            confidence = 0.8;
        } else {
            try {
                const aiResult = await aiService.generateExplanation(
                    `Klasifikasikan kata "${audio_text}" apakah termasuk: iya, tidak, smart_review, quiz, chat, atau baca. Balas hanya dengan satu kata kategori tersebut.`,
                    'simple'
                );
                const clean = aiResult.toLowerCase().trim();
                if (['iya', 'tidak', 'smart_review', 'quiz', 'chat', 'baca'].includes(clean)) {
                    keyword = clean;
                    confidence = 0.7;
                }
            } catch (e) {
                console.warn('AI keyword detection fallback:', e.message);
            }
        }

        res.json({ keyword, confidence, original: audio_text });
    } catch (err) {
        console.error('Error di detectKeyword:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getDeviceInfo(req, res) {
    try {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        const addresses = [];

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    addresses.push(iface.address);
                }
            }
        }

        res.json({
            server_ip: addresses[0] || '127.0.0.1',
            port: process.env.PORT || 5000,
            url: `http://${addresses[0] || '127.0.0.1'}:${process.env.PORT || 5000}`,
            api_endpoints: {
                book: '/api/book/:page',
                activity: '/api/activity',
                quiz: '/api/quiz-activity',
                chat: '/api/chat',
                explain: '/api/explain',
                stream: '/api/stream',
                cache: '/api/cache/status'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { detectKeyword, getDeviceInfo };
