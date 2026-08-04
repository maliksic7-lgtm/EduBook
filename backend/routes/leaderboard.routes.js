const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const Friendship = require('../models/Friendship');

router.get('/leaderboard', async (req, res) => {
    try {
        const period = req.query.period || 'weekly';
        const category = req.query.category || 'xp';
        const friendOf = req.query.friend_of || '';
        const kelasFilter = req.query.kelas || '';
        const semesterFilter = req.query.semester || '';

        const now = new Date();
        let startDate;
        switch (period) {
            case 'monthly': startDate = new Date(now.setDate(now.getDate() - 30)); break;
            case 'yearly': startDate = new Date(now.setDate(now.getDate() - 365)); break;
            case 'all': startDate = new Date(0); break;
            default: startDate = new Date(now.setDate(now.getDate() - 7)); break;
        }

        let friendNames = [];
        if (friendOf) {
            const following = await Friendship.find({ follower: friendOf }).select('following');
            const followers = await Friendship.find({ following: friendOf }).select('follower');
            const friendIds = following.map(f => f.following).filter(id =>
                followers.some(f => f.follower === id)
            );
            const friendUsers = await User.find({ user_id: { $in: friendIds } }).select('nama');
            friendNames = friendUsers.map(u => u.nama);
            friendNames.push(req.query.my_name || '');
        }

        let filteredNames = null;
        if (kelasFilter || semesterFilter) {
            const filter = {};
            if (kelasFilter) filter.kelas = kelasFilter;
            if (semesterFilter) filter.semester = Number(semesterFilter);
            const filteredUsers = await User.find(filter).select('nama');
            filteredNames = filteredUsers.map(u => u.nama);
        }

        const matchStage = {
            $match: {
                timestamp: { $gte: startDate },
                ...(friendOf && friendNames.length > 0 ? { student_name: { $in: friendNames } } : {}),
                ...(filteredNames ? { student_name: { $in: filteredNames } } : {})
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
            const streakData = aggResults.map(r => {
                const sorted = [...r.dates].sort();
                let best = 0, cur = 1;
                for (let i = 1; i < sorted.length; i++) {
                    const d1 = new Date(sorted[i - 1]);
                    const d2 = new Date(sorted[i]);
                    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
                    if (Math.round(diff) === 1) cur++;
                    else { best = Math.max(best, cur); cur = 1; }
                }
                best = Math.max(best, cur);
                return { student_name: r._id, value: best };
            });
            streakData.sort((a, b) => b.value - a.value);
            results = streakData.slice(0, 20);
        } else if (category === 'quiz_accuracy') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'quiz' } },
                { $group: { _id: '$student_name', value: { $avg: '$hafalan_features.score' }, count: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'quiz_count') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'quiz' } },
                { $group: { _id: '$student_name', value: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'hafalan_accuracy') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'hafalan' } },
                { $group: { _id: '$student_name', value: { $avg: '$hafalan_features.score' }, count: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'hafalan_count') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'hafalan' } },
                { $group: { _id: '$student_name', value: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'listening_accuracy') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'listening' } },
                { $group: { _id: '$student_name', value: { $avg: '$hafalan_features.score' }, count: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'listening_count') {
            pipeline = [
                matchStage,
                { $match: { activity_type: 'listening' } },
                { $group: { _id: '$student_name', value: { $sum: 1 } } },
                { $sort: { value: -1 } },
                { $limit: 20 }
            ];
            results = await Activity.aggregate(pipeline);
        } else if (category === 'rank') {
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

        const rankData = [
            { lv: 1, title: 'Pemula AIoT Base', min: 0 },
            { lv: 2, title: 'Pengamat AIoT', min: 300 },
            { lv: 3, title: 'Penjelajah AIoT', min: 800 },
            { lv: 4, title: 'Perakit AIoT', min: 1500 },
            { lv: 5, title: 'Builder AIoT', min: 2500 },
            { lv: 6, title: 'Insinyur AIoT', min: 4000 },
            { lv: 7, title: 'Arsitek AIoT', min: 6000 },
            { lv: 8, title: 'Inovator AIoT', min: 9000 },
            { lv: 9, title: 'Master AIoT', min: 13000 },
            { lv: 10, title: 'Grand Master AIoT', min: 18000 }
        ];

        const ranked = results.map((r, i) => {
            const name = r.student_name || r._id;
            const base = { rank: i + 1, student_name: name, foto_profil: fotoMap[name] || '' };

            if (category === 'xp') {
                const xp = r.totalXP || 0;
                return { ...base, value: xp, display: xp + ' XP', sub: (r.hafalan_count || 0) + ' Hafalan · ' + (r.quiz_correct || 0) + ' Kuis · ' + (r.listening_count || 0) + ' Dengar', unit: 'xp' };
            } else if (category === 'quiz_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kuis', unit: '%' };
            } else if (category === 'quiz_count') {
                const v = r.value || 0;
                return { ...base, value: v, display: v + 'x', unit: 'kuis' };
            } else if (category === 'hafalan_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kali', unit: '%' };
            } else if (category === 'hafalan_count') {
                const v = r.value || 0;
                return { ...base, value: v, display: v + 'x', unit: 'hafalan' };
            } else if (category === 'listening_accuracy') {
                const v = Math.round(r.value || 0);
                return { ...base, value: v, display: v + '%', sub: (r.count || 0) + ' kali', unit: '%' };
            } else if (category === 'listening_count') {
                const v = r.value || 0;
                return { ...base, value: v, display: v + 'x', unit: 'listening' };
            } else if (category === 'streak') {
                return { ...base, value: r.value || 0, display: (r.value || 0) + ' hari', unit: 'hari' };
            } else if (category === 'rank') {
                const xp = r.totalXP || 0;
                let level = 1;
                for (const rd of rankData) { if (xp < rd.min) break; level = rd.lv; }
                return { ...base, value: level, display: 'Level ' + level, sub: rankData[level - 1].title + ' · ' + xp + ' XP', unit: 'lv' };
            }
            return base;
        });

        res.json(ranked);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
