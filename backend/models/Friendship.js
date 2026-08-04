const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
    follower: { type: String, required: true },
    following: { type: String, required: true }
}, { timestamps: true });

FriendshipSchema.index({ follower: 1, following: 1 }, { unique: true });
FriendshipSchema.index({ following: 1 });

module.exports = mongoose.model('Friendship', FriendshipSchema);
