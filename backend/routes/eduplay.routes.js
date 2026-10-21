const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GameResult = require('../models/GameResult');
const { authenticateToken } = require('../middleware/auth');
const { getAvailableSubjects } = require('../services/subjectAccess');
const { gameList } = require('../services/eduplayService');

router.get('/meta', authenticateToken, async (req, res) => {
    try {
        const [user, subjects, results, top] = await Promise.all([
            User.findOne({ user_id: req.user.user_id })
                .select('game_xp game_rating game_matches')
                .lean(),
            getAvailableSubjects(req.user),
            GameResult.find({ user_id: req.user.user_id })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
            User.find({ game_matches: { $gt: 0 } })
                .select('nama user_id foto_profil game_xp game_rating game_matches')
                .sort({ game_xp: -1 })
                .limit(10)
                .lean()
        ]);

        res.json({
            games: gameList(),
            stats: {
                game_xp: user?.game_xp || 0,
                game_rating: user?.game_rating || 1000,
                game_matches: user?.game_matches || 0
            },
            recent: results.map(r => ({
                id: r._id,
                game: r.game,
                score: r.score,
                correct: r.correct,
                total: r.total,
                placement: r.placement,
                xp_earned: r.xp_earned,
                has_bot: r.has_bot,
                subject_name: r.subject_name,
                created_at: r.createdAt
            })),
            top_players: top,
            topics: subjects.map(s => ({
                subject_id: s.subject_id,
                nama: s.nama,
                kategori: s.kategori,
                icon: s.icon || '📚'
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
