const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true },
    nama: { type: String, default: '' },
    url: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema);
