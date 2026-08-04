// explain.controller.js
//
// PERBAIKAN dibanding versi sebelumnya: endpoint /api/ai/content-insight
// dulunya melakukan HTTP fetch ke endpoint /api/explain milik server-nya
// sendiri (`fetch('http://localhost:5000/api/explain', ...)`). Ini
// anti-pattern — server memanggil dirinya sendiri lewat network stack,
// padahal cukup panggil function yang sama secara langsung. Selain lebih
// lambat (bulak-balik HTTP untuk hal yang bisa dipanggil langsung), ini
// juga rapuh: kalau PORT berubah atau server diakses lewat domain lain,
// endpoint ini akan gagal diam-diam. Sekarang keduanya sama-sama panggil
// aiService.generateExplanation() langsung.

const aiService = require('../services/aiService');

async function explainText(req, res) {
    try {
        const { text, mode } = req.body;

        if (!text) return res.status(400).json({ message: 'Teks yang diseleksi tidak boleh kosong.' });

        const hasilEksplanasi = await aiService.generateExplanation(text, mode);

        res.json({ status: "success", explanation: hasilEksplanasi });
    } catch (err) {
        console.error("🚨 Error di explainText:", err);
        res.status(500).json({ error: "Gagal memproses penjelasan AI: " + err.message });
    }
}

async function contentInsightRedirect(req, res) {
    try {
        const { paragraph_text, action } = req.body;
        if (!paragraph_text) return res.status(400).json({ message: 'Teks paragraf buku diperlukan.' });

        const mode = action === "sederhanakan" ? "simplify" : "detail";
        const result = await aiService.generateExplanation(paragraph_text, mode);

        res.json({ status: "success", action, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { explainText, contentInsightRedirect };
