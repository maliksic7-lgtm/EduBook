const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const Friendship = require('../models/Friendship');

const RANK_DATA = [
    { lv: 1, title: 'Pemula', min: 0 },
    { lv: 2, title: 'Pengamat', min: 300 },
    { lv: 3, title: 'Penjelajah', min: 800 },
    { lv: 4, title: 'Perakit', min: 1500 },
    { lv: 5, title: 'Builder', min: 2500 },
    { lv: 6, title: 'Insinyur', min: 4000 },
    { lv: 7, title: 'Arsitek', min: 6000 },
    { lv: 8, title: 'Inovator', min: 9000 },
    { lv: 9, title: 'Master', min: 13000 },
    { lv: 10, title: 'Grand Master', min: 18000 }
];

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

router.get('/leaderboard', async (req, res) => {
    try {
        const period = req.query.period || 'weekly';
        const category = req.query.category || 'xp';
        const friendOf = req.query.friend_of || '';
        const kelasFilter = req.query.kelas || '';
        const semesterFilter = req.query.semester || '';
        const provinsiFilter = (req.query.provinsi || '').trim();
        const kotaFilter = (req.query.kota || '').trim();
        const subjectId = (req.query.subject_id || '').trim();

        const now = new Date();
        let startDate;
        switch (period) {
            case 'monthly': startDate = new Date(now.setDate(now.getDate() - 30)); break;
            case 'yearly': startDate = new Date(now.setDate(now.getDate() - 365)); break;
            case 'all': startDate = new Date(0); break;
            default: startDate = new Date(now.setDate(now.getDate() - 7)); break;
        }

        let scopeNames = null;
        if (friendOf) {
            const following = await Friendship.find({ follower: friendOf }).select('following');
            const followers = await Friendship.find({ following: friendOf }).select('follower');
            const friendIds = following.map(f => f.following).filter(id => followers.some(f => f.follower === id));
            const friendUsers = await User.find({ user_id: { $in: friendIds } }).select('nama');
            const names = friendUsers.map(u => u.nama);
            if (req.query.my_name) names.push(req.query.my_name);
            scopeNames = names;
        }

        if (provinsiFilter || kotaFilter || kelasFilter || semesterFilter) {
            const filter = {};
            if (provinsiFilter) filter.provinsi = provinsiFilter;
            if (kotaFilter) filter.kota = kotaFilter;
            if (kelasFilter) filter.kelas = kelasFilter;
            if (semesterFilter) filter.semester = Number(semesterFilter);
            const filteredUsers = await User.find(filter).select('nama');
            const names = filteredUsers.map(u => u.nama);
            scopeNames = scopeNames ? scopeNames.filter(n => names.includes(n)) : names;
        }

        const matchStage = {
            $match: {
                timestamp: { $gte: startDate },
                ...(scopeNames ? { student_name: { $in: scopeNames } } : {}),
                ...(subjectId ? { subject_id: subjectId } : {})
            }
        };

        let results, pipeline;

        if (category === 'streak') {
            pipeline = [
                matchStage,
                { $group: { _id: { student: '$student_name', date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } } } },
                { $group: { _id: '$_id.student', dates: { $addToSet: '$_id.date' } } }
            ];
            const aggResults = await Activity.aggregate(pipeline);
            const streakData = aggResults.map(r => ({ student_name: r._id, value: calcBestStreak(r.dates) }));
            streakData.sort((a, b) => b.value - a.value);
            results = streakData.slice(0, 20);
        } else if (category === 'overall') {
            pipeline = [
                matchStage,
                { $group: {
                    _id: '$student_name',
                    hafalan_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, 1, 0] } },
                    quiz_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, 1, 0] } },
                    listening_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, 1, 0] } },
                    haf_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, '$hafalan_features.score', 0] } },
                    quiz_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, '$hafalan_features.score', 0] } },
                    listen_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, '$hafalan_features.score', 0] } },
                    quiz_correct: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, { $round: [{ $divide: [{ $multiply: ['$hafalan_features.score', { $ifNull: ['$quiz_total_questions', 0] }] }, 100] }, 0] }, 0] } },
                    subjects: { $addToSet: '$subject_id' },
                    dates: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } }
                } }
            ];
            const aggResults = await Activity.aggregate(pipeline);
            const rows = aggResults.map(r => {
                const xp = r.hafalan_count * 15 + r.quiz_correct * 5 + r.listening_count * 10;
                const accs = [];
                if (r.hafalan_count) accs.push(r.haf_sum / r.hafalan_count);
                if (r.quiz_count) accs.push(r.quiz_sum / r.quiz_count);
                if (r.listening_count) accs.push(r.listen_sum / r.listening_count);
                const avgAcc = accs.length ? accs.reduce((s, v) => s + v, 0) / accs.length : 0;
                const accBonus = Math.round(avgAcc * 5);
                const actBonus = Math.min(r.hafalan_count, 50) * 2 + Math.min(r.quiz_count, 50) * 2 + Math.min(r.listening_count, 50) * 2;
                const streak = calcBestStreak(r.dates);
                const streakBonus = streak * 20;
                const diversityBonus = (r.subjects || []).filter(Boolean).length * 40;
                const daysBonus = (r.dates || []).length * 10;
                const points = xp + accBonus + actBonus + streakBonus + diversityBonus + daysBonus;
                return { student_name: r._id, points, xp, avgAcc: Math.round(avgAcc), streak, subjects: (r.subjects || []).filter(Boolean).length };
            });
            rows.sort((a, b) => b.points - a.points);
            results = rows.slice(0, 20);
        } else if (category === 'subject') {
            pipeline = [
                matchStage,
                { $group: {
                    _id: '$student_name',
                    haf_n: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, 1, 0] } },
                    quiz_n: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, 1, 0] } },
                    listen_n: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, 1, 0] } },
                    haf_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, '$hafalan_features.score', 0] } },
                    quiz_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, '$hafalan_features.score', 0] } },
                    listen_sum: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, '$hafalan_features.score', 0] } }
                } }
            ];
            const aggResults = await Activity.aggregate(pipeline);
            const rows = aggResults.map(r => {
                const totalN = r.haf_n + r.quiz_n + r.listen_n;
                const totalSum = r.haf_sum + r.quiz_sum + r.listen_sum;
                const score = totalN ? Math.round(totalSum / totalN) : 0;
                return { student_name: r._id, value: score, haf_n: r.haf_n, quiz_n: r.quiz_n, listen_n: r.listen_n, totalN };
            }).filter(r => r.totalN >= 1);
            rows.sort((a, b) => b.value - a.value || b.totalN - a.totalN);
            results = rows.slice(0, 20);
        } else if (category === 'quiz_accuracy' || category === 'hafalan_accuracy' || category === 'listening_accuracy') {
            const type = category === 'quiz_accuracy' ? 'quiz' : category === 'hafalan_accuracy' ? 'hafalan' : 'listening';
            pipeline = [
                matchStage,
                { $match: { activity_type: type } },
                { $group: { _id: '$student_name', value: { $avg: '$hafalan_features.score' }, count: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'quiz_count' || category === 'hafalan_count' || category === 'listening_count') {
            const type = category === 'quiz_count' ? 'quiz' : category === 'hafalan_count' ? 'hafalan' : 'listening';
            pipeline = [
                matchStage,
                { $match: { activity_type: type } },
                { $group: { _id: '$student_name', value: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else {
            pipeline = [
                matchStage,
                { $group: {
                    _id: '$student_name',
                    hafalan_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'hafalan'] }, 1, 0] } },
                    quiz_correct: { $sum: { $cond: [{ $eq: ['$activity_type', 'quiz'] }, { $round: [{ $divide: [{ $multiply: ['$hafalan_features.score', { $ifNull: ['$quiz_total_questions', 0] }] }, 100] }, 0] }, 0] } },
                    listening_count: { $sum: { $cond: [{ $eq: ['$activity_type', 'listening'] }, 1, 0] } }
                } },
                { $addFields: { totalXP: { $add: [{ $multiply: ['$hafalan_count', 15] }, { $multiply: ['$quiz_correct', 5] }, { $multiply: ['$listening_count', 10] }] } } },
                { $sort: { totalXP: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        }

        const names = results.map(r => r.student_name || r._id);
        const users = await User.find({ nama: { $in: names } }).select('nama foto_profil');
        const fotoMap = {};
        users.forEach(u => { fotoMap[u.nama] = u.foto_profil; });
        let subjectName = '';
        if (subjectId) {
            const Subject = require('../models/Subject');
            const s = await Subject.findOne({ subject_id: subjectId }).select('nama');
            subjectName = s ? s.nama : subjectId;
        }

        const ranked = results.map((r, i) => {
            const name = r.student_name || r._id;
            const base = { rank: i + 1, student_name: name, foto_profil: fotoMap[name] || '' };

            if (category === 'xp') {
                const xp = r.totalXP || 0;
                return { ...base, value: xp, display: xp + ' XP', sub: (r.hafalan_count || 0) + ' Hafalan · ' + (r.quiz_correct || 0) + ' Kuis · ' + (r.listening_count || 0) + ' Dengar', unit: 'xp' };
            } else if (category === 'overall') {
                return { ...base, value: r.points, display: r.points + ' poin', sub: r.xp + ' XP · rata² ' + r.avgAcc + '% · 🔥' + r.streak + ' hari · ' + r.subjects + ' mapel', unit: 'poin' };
            } else if (category === 'subject') {
                return { ...base, value: Math.round(r.value || 0), display: Math.round(r.value || 0) + '%', sub: '📖 ' + r.haf_n + ' · ✏️ ' + r.quiz_n + ' · 🎧 ' + r.listen_n, unit: '%' };
            } else if (category === 'quiz_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kuis', unit: '%' };
            } else if (category === 'quiz_count') {
                return { ...base, value: r.value || 0, display: (r.value || 0) + 'x', unit: 'kuis' };
            } else if (category === 'hafalan_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kali', unit: '%' };
            } else if (category === 'hafalan_count') {
                return { ...base, value: r.value || 0, display: (r.value || 0) + 'x', unit: 'hafalan' };
            } else if (category === 'listening_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kali', unit: '%' };
            } else if (category === 'listening_count') {
                return { ...base, value: r.value || 0, display: (r.value || 0) + 'x', unit: 'listening' };
            } else if (category === 'streak') {
                return { ...base, value: r.value || 0, display: (r.value || 0) + ' hari', unit: 'hari' };
            } else if (category === 'rank') {
                const xp = r.totalXP || 0;
                let level = 1;
                for (const rd of RANK_DATA) { if (xp < rd.min) break; level = rd.lv; }
                return { ...base, value: level, display: 'Level ' + level, sub: RANK_DATA[level - 1].title + ' · ' + xp + ' XP', unit: 'lv' };
            }
            return base;
        });

        res.json({ subject_name: subjectName, rows: ranked });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
