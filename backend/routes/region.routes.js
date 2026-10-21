const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

let REGIONS = [];
try {
    REGIONS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'regions.json'), 'utf8'));
} catch (e) {
    console.error('Gagal memuat data wilayah:', e.message);
}

function normalize(s) {
    return String(s || '').toLowerCase().replace(/^(kabupaten|kab\.?|kota)\s+/i, '').trim();
}

router.get('/', (req, res) => {
    try {
        const q = String(req.query.q || '').trim().toLowerCase();
        const limit = Math.min(30, Math.max(1, parseInt(req.query.limit) || 20));
        let list = REGIONS;
        if (q) {
            const nq = normalize(q);
            list = REGIONS.filter(r =>
                r.provinsi.toLowerCase().includes(q) ||
                r.kota.toLowerCase().includes(q) ||
                normalize(r.kota).includes(nq) ||
                normalize(r.provinsi).includes(nq)
            );
        }
        res.json({ total: list.length, results: list.slice(0, limit).map(r => ({ provinsi: r.provinsi, kota: r.kota })) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/provinces', (req, res) => {
    try {
        const set = new Set(REGIONS.map(r => r.provinsi));
        res.json({ provinces: Array.from(set) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
