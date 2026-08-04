const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    student_name: { type: String, required: true, index: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily', required: true },
    period_key: { type: String, required: true },
    quests: [{
        id: String,
        title: String,
        desc: String,
        target: Number,
        progress: { type: Number, default: 0 },
        done: { type: Boolean, default: false },
        xp_reward: Number
    }],
    all_done: { type: Boolean, default: false },
    bonus_claimed: { type: Boolean, default: false }
});

QuestSchema.index({ student_name: 1, period: 1, period_key: 1 }, { unique: true });

const DailyQuest = mongoose.model('DailyQuest', QuestSchema);

(async () => {
    try {
        await DailyQuest.collection.dropIndex('student_name_1_date_1');
        console.log('✅ Old index student_name_1_date_1 dropped');
    } catch (e) {
        if (e.code !== 27) console.log('ℹ️  Old index not found, skipping');
    }
})();

module.exports = DailyQuest;
