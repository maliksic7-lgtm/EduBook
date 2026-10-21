const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true },
    nama: { type: String, required: true },
    game: { type: String, required: true, index: true },
    room_code: { type: String, default: '' },
    topic: { type: String, default: 'umum' },
    subject_name: { type: String, default: '' },
    difficulty: { type: String, default: 'medium' },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    placement: { type: Number, default: 0 },
    xp_earned: { type: Number, default: 0 },
    rating_delta: { type: Number, default: 0 },
    players_count: { type: Number, default: 1 },
    has_bot: { type: Boolean, default: false }
}, { timestamps: true });

GameResultSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('GameResult', GameResultSchema);
