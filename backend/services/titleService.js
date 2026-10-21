const Activity = require('../models/Activity');
const User = require('../models/User');

const TITLE_DEFS = [
    { title: '#1 XP - Mingguan', desc: 'Peringkat 1 XP minggu ini', category: 'xp', period: 'weekly' },
    { title: '#1 XP - Bulanan', desc: 'Peringkat 1 XP bulan ini', category: 'xp', period: 'monthly' },
    { title: '#1 XP - Tahunan', desc: 'Peringkat 1 XP tahun ini', category: 'xp', period: 'yearly' },
    { title: '#1 Akurasi Kuis - Mingguan', desc: 'Peringkat 1 akurasi kuis minggu ini', category: 'quiz_accuracy', period: 'weekly' },
    { title: '#1 Akurasi Kuis - Bulanan', desc: 'Peringkat 1 akurasi kuis bulan ini', category: 'quiz_accuracy', period: 'monthly' },
    { title: '#1 Total Kuis - Mingguan', desc: 'Peringkat 1 total kuis minggu ini', category: 'quiz_count', period: 'weekly' },
    { title: '#1 Akurasi Hafalan - Mingguan', desc: 'Peringkat 1 akurasi hafalan minggu ini', category: 'hafalan_accuracy', period: 'weekly' },
    { title: '#1 Total Hafalan - Mingguan', desc: 'Peringkat 1 total hafalan minggu ini', category: 'hafalan_count', period: 'weekly' },
    { title: '#1 Streak - Mingguan', desc: 'Peringkat 1 streak minggu ini', category: 'streak', period: 'weekly' },
    { title: '#1 Rank - Mingguan', desc: 'Peringkat 1 level minggu ini', category: 'rank', period: 'weekly' }
];

const PERIOD_DAYS = { weekly: 7, monthly: 30, yearly: 365 };

function periodStart(period) {
    const days = PERIOD_DAYS[period] || 7;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function calcBestStreak(dates) {
    const sorted = [...dates].sort();
    let best = 0, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
        if (Math.round(diff) === 1) cur++;
        else { best = Math.max(best, cur); cur = 1; }
    }
    best = Math.max(best, cur);
    return sorted.length ? best : 0;
}

async function rowsFor(category, startDate) {
    const match = { $match: { timestamp: { $gte: startDate } } };

    if (category === 'xp' || category === 'rank') {
        return Activity.aggregate([
            match,
            {
                $group: {
                    _id: '$student_name',
                    hafalan_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, 1, 0] } },
                    quiz_correct: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, { $round: [{ $divide: [{ $multiply: ['$hafalan_features.score', { $ifNull: ['$quiz_total_questions', 0] }] }, 100] }, 0] }, 0] } },
                    listening_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, 1, 0] } }
                }
            },
            {
                $addFields: {
                    value: {
                        $add: [
                            { $multiply: ['$hafalan_count', 15] },
                            { $multiply: ['$quiz_correct', 5] },
                            { $multiply: ['$listening_count', 10] }
                        ]
                    }
                }
            },
            { $project: { _id: 1, value: 1 } }
        ]);
    }

    if (category === 'streak') {
        const grouped = await Activity.aggregate([
            match,
            { $group: { _id: { student: '$student_name', date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } } } },
            { $group: { _id: '$_id.student', dates: { $addToSet: '$_id.date' } } }
        ]);
        return grouped.map(r => ({ _id: r._id, value: calcBestStreak(r.dates) }));
    }

    const typeMap = {
        quiz_accuracy: { type: 'quiz', field: '$hafalan_features.score', mode: 'avg' },
        hafalan_accuracy: { type: 'hafalan', field: '$hafalan_features.score', mode: 'avg' },
        quiz_count: { type: 'quiz', mode: 'count' },
        hafalan_count: { type: 'hafalan', mode: 'count' }
    };
    const cfg = typeMap[category];
    if (!cfg) return [];
    const group = cfg.mode === 'avg'
        ? { _id: '$student_name', value: { $avg: cfg.field } }
        : { _id: '$student_name', value: { $sum: 1 } };
    return Activity.aggregate([
        match,
        { $match: { activity_type: cfg.type } },
        { $group: group },
        { $project: { _id: 1, value: 1 } }
    ]);
}

function evaluate(def, rows, nama) {
    let top = 0;
    let mine = 0;
    for (const row of rows) {
        const value = Number(row.value) || 0;
        if (value > top) top = value;
        if (row._id === nama) mine = value;
    }
    return { earned: top > 0 && mine >= top, value: mine, top };
}

async function computeEarnedTitles(user) {
    if (!user || !user.nama) {
        return TITLE_DEFS.map(d => ({ ...d, earned: false, value: 0, top: 0 }));
    }
    const keys = [...new Set(TITLE_DEFS.map(d => d.category + '|' + d.period))];
    const resultMap = {};
    await Promise.all(keys.map(async key => {
        const [category, period] = key.split('|');
        try {
            resultMap[key] = await rowsFor(category, periodStart(period));
        } catch (err) {
            resultMap[key] = [];
        }
    }));
    return TITLE_DEFS.map(def => {
        const rows = resultMap[def.category + '|' + def.period] || [];
        return { ...def, ...evaluate(def, rows, user.nama) };
    });
}

async function sanitizeTitle(user) {
    if (!user || !user.title) return '';
    const def = TITLE_DEFS.find(d => d.title === user.title);
    if (!def) {
        await User.updateOne({ user_id: user.user_id }, { $set: { title: '' } });
        return '';
    }
    try {
        const rows = await rowsFor(def.category, periodStart(def.period));
        const { earned } = evaluate(def, rows, user.nama);
        if (!earned) {
            await User.updateOne({ user_id: user.user_id }, { $set: { title: '' } });
            return '';
        }
    } catch (err) {
        return user.title;
    }
    return user.title;
}

module.exports = { TITLE_DEFS, computeEarnedTitles, sanitizeTitle };
