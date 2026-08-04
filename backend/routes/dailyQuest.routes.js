const express = require('express');
const router = express.Router();
const DailyQuest = require('../models/DailyQuest');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');

function pad(n) { return String(n).padStart(2, '0'); }

function getDateStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function getWeekKey(d) {
    d = d || new Date();
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return start.getFullYear() + '-W' + pad(Math.ceil((((start - new Date(start.getFullYear(), 0, 1)) / 86400000) + start.getDay() + 1) / 7));
}

function getMonthKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
}

function getRange(period) {
    const now = new Date();
    let start, end;
    if (period === 'daily') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start.getTime() + 86400000);
    } else if (period === 'weekly') {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - start.getDay());
        end = new Date(start.getTime() + 7 * 86400000);
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    return { start, end };
}

const QUEST_DEFS = {
    daily: [
        { id: 'read_1', title: 'Baca 1 Halaman', desc: 'Baca materi di tab literasi', target: 1, xp_reward: 10 },
        { id: 'hafalan_1', title: '1 Sesi Hafalan', desc: 'Selesaikan 1 sesi Smart Review', target: 1, xp_reward: 10 },
        { id: 'quiz_1', title: '1 Tantangan Kuis', desc: 'Kerjakan 1 paket kuis', target: 1, xp_reward: 10 },
        { id: 'listen_5', title: '5 Latihan Dengar', desc: 'Selesaikan 5 soal mendengarkan', target: 5, xp_reward: 10 },
        { id: 'xp_20', title: 'Kumpulkan 20 XP', desc: 'Dapatkan total 20 XP hari ini', target: 20, xp_reward: 10 },
        { id: 'duration_15', title: 'Belajar 15 Menit', desc: 'Akumulasi 15 menit belajar hari ini', target: 15, xp_reward: 10 }
    ],
    weekly: [
        { id: 'w_read_5', title: 'Baca 5 Halaman', desc: 'Baca 5 halaman berbeda', target: 5, xp_reward: 20 },
        { id: 'w_read_10', title: 'Baca 10 Halaman', desc: 'Baca 10 halaman berbeda', target: 10, xp_reward: 20 },
        { id: 'w_hafalan_5', title: '5 Sesi Hafalan', desc: 'Selesaikan 5 sesi Smart Review', target: 5, xp_reward: 20 },
        { id: 'w_quiz_3', title: '3 Tantangan Kuis', desc: 'Kerjakan 3 paket kuis', target: 3, xp_reward: 20 },
        { id: 'w_quiz_5', title: '5 Tantangan Kuis', desc: 'Kerjakan 5 paket kuis', target: 5, xp_reward: 20 },
        { id: 'w_listen_10', title: '10 Latihan Dengar', desc: 'Selesaikan 10 soal mendengarkan', target: 10, xp_reward: 20 },
        { id: 'w_listen_20', title: '20 Latihan Dengar', desc: 'Selesaikan 20 soal mendengarkan', target: 20, xp_reward: 20 },
        { id: 'w_xp_200', title: 'Kumpulkan 200 XP', desc: 'Dapatkan total 200 XP', target: 200, xp_reward: 20 },
        { id: 'w_xp_500', title: 'Kumpulkan 500 XP', desc: 'Dapatkan total 500 XP', target: 500, xp_reward: 20 },
        { id: 'w_duration_60', title: 'Belajar 60 Menit', desc: 'Akumulasi 60 menit belajar', target: 60, xp_reward: 20 },
        { id: 'w_duration_120', title: 'Belajar 120 Menit', desc: 'Akumulasi 120 menit belajar', target: 120, xp_reward: 20 },
        { id: 'w_acc_70', title: 'Akurasi Kuis 70%', desc: 'Rata-rata akurasi kuis >= 70%', target: 70, xp_reward: 20 }
    ],
    monthly: [
        { id: 'm_read_20', title: 'Baca 20 Halaman', desc: 'Baca 20 halaman berbeda', target: 20, xp_reward: 30 },
        { id: 'm_read_40', title: 'Baca 40 Halaman', desc: 'Baca 40 halaman berbeda', target: 40, xp_reward: 30 },
        { id: 'm_read_all', title: 'Baca Semua Halaman', desc: 'Baca semua 10 halaman unik', target: 10, xp_reward: 30 },
        { id: 'm_hafalan_20', title: '20 Sesi Hafalan', desc: 'Selesaikan 20 sesi Smart Review', target: 20, xp_reward: 30 },
        { id: 'm_hafalan_40', title: '40 Sesi Hafalan', desc: 'Selesaikan 40 sesi Smart Review', target: 40, xp_reward: 30 },
        { id: 'm_quiz_10', title: '10 Tantangan Kuis', desc: 'Kerjakan 10 paket kuis', target: 10, xp_reward: 30 },
        { id: 'm_quiz_20', title: '20 Tantangan Kuis', desc: 'Kerjakan 20 paket kuis', target: 20, xp_reward: 30 },
        { id: 'm_listen_20', title: '20 Latihan Dengar', desc: 'Selesaikan 20 soal mendengarkan', target: 20, xp_reward: 30 },
        { id: 'm_listen_50', title: '50 Latihan Dengar', desc: 'Selesaikan 50 soal mendengarkan', target: 50, xp_reward: 30 },
        { id: 'm_xp_1000', title: 'Kumpulkan 1000 XP', desc: 'Dapatkan total 1000 XP', target: 1000, xp_reward: 30 },
        { id: 'm_xp_3000', title: 'Kumpulkan 3000 XP', desc: 'Dapatkan total 3000 XP', target: 3000, xp_reward: 30 },
        { id: 'm_duration_300', title: 'Belajar 300 Menit', desc: 'Akumulasi 300 menit belajar', target: 300, xp_reward: 30 },
        { id: 'm_duration_600', title: 'Belajar 600 Menit', desc: 'Akumulasi 600 menit belajar', target: 600, xp_reward: 30 },
        { id: 'm_acc_75', title: 'Akurasi Kuis 75%', desc: 'Rata-rata akurasi kuis >= 75%', target: 75, xp_reward: 30 },
        { id: 'm_acc_90', title: 'Akurasi Kuis 90%', desc: 'Rata-rata akurasi kuis >= 90%', target: 90, xp_reward: 30 },
        { id: 'm_pages_unique', title: 'Semua Halaman Dikuis', desc: 'Kuis di semua 10 halaman', target: 10, xp_reward: 30 },
        { id: 'm_double_5', title: '5 Hari Hafalan + Kuis', desc: '5 hari dgn hafalan & kuis', target: 5, xp_reward: 30 },
        { id: 'm_master_3', title: '3 Halaman Skor 100%', desc: 'Skor 100% di 3 halaman berbeda', target: 3, xp_reward: 30 }
    ]
};

async function getOrCreateQuestDoc(student, period) {
    const keyFn = { daily: getDateStr, weekly: getWeekKey, monthly: getMonthKey };
    const period_key = keyFn[period]();
    let doc = await DailyQuest.findOne({ student_name: student, period, period_key });
    if (!doc) {
        const defs = QUEST_DEFS[period];
        doc = new DailyQuest({
            student_name: student,
            period,
            period_key,
            quests: defs.map(q => ({ ...q, progress: 0, done: false }))
        });
        await doc.save();
    } else {
        let changed = false;
        QUEST_DEFS[period].forEach(qd => {
            if (!doc.quests.some(ex => ex.id === qd.id)) {
                doc.quests.push({ ...qd, progress: 0, done: false });
                changed = true;
            }
        });
        if (changed) await doc.save();
    }
    return doc;
}

async function computeProgress(period, student, questDoc) {
    const range = getRange(period);
    const activities = await Activity.find({
        student_name: student,
        timestamp: { $gte: range.start, $lt: range.end }
    });

    let readCount = 0, quizCount = 0, hafalanCount = 0, listeningQuestionCount = 0;
    let todayXP = 0, totalDuration = 0;
    let quizScores = [];
    let uniquePages = new Set();
    let quizUniquePages = new Set();
    let dayHafalan = new Set(), dayQuiz = new Set();
    let perfectPages = new Set();
    let hafalanPageCounts = {};

    activities.forEach(a => {
        if (a.activity_type === 'hafalan') {
            readCount++;
            hafalanCount++;
            todayXP += 15;
            totalDuration += a.duration_minutes || 0;
            if (a.current_page) {
                uniquePages.add(a.current_page);
                hafalanPageCounts[a.current_page] = (hafalanPageCounts[a.current_page] || 0) + 1;
                if (a.hafalan_features?.score >= 100) perfectPages.add(a.current_page);
            }
            if (a.timestamp) dayHafalan.add(getDateStr(new Date(a.timestamp)));
        } else if (a.activity_type === 'quiz' || a.activity_type === 'listening') {
            if (a.activity_type === 'listening') {
                listeningQuestionCount += a.total_soal || 0;
            } else {
                quizCount++;
            }
            const correct = Math.round((a.hafalan_features.score / 100) * (a.quiz_total_questions || 0));
            todayXP += correct * 5;
            totalDuration += a.duration_minutes || 0;
            if (a.hafalan_features?.score) quizScores.push(a.hafalan_features.score);
            if (a.current_page) quizUniquePages.add(a.current_page);
            if (a.timestamp) dayQuiz.add(getDateStr(new Date(a.timestamp)));
            if (a.hafalan_features?.score >= 100 && a.current_page) perfectPages.add(a.current_page);
        }
    });

    const avgQuizAcc = quizScores.length > 0 ? Math.round(quizScores.reduce((s, v) => s + v, 0) / quizScores.length) : 0;
    let doubleDays = 0;
    dayHafalan.forEach(day => { if (dayQuiz.has(day)) doubleDays++; });

    const quests = questDoc.quests.map(q => {
        if (q.id === 'read_1' || q.id === 'w_read_5' || q.id === 'w_read_10' ||
            q.id === 'm_read_20' || q.id === 'm_read_40') {
            q.progress = Math.min(readCount, q.target); q.done = readCount >= q.target;
        }
        if (q.id === 'm_read_all') {
            q.progress = Math.min(uniquePages.size, q.target); q.done = uniquePages.size >= q.target;
        }
        if (q.id === 'hafalan_1' || q.id === 'w_hafalan_5' ||
            q.id === 'm_hafalan_20' || q.id === 'm_hafalan_40') {
            q.progress = Math.min(hafalanCount, q.target); q.done = hafalanCount >= q.target;
        }
        if (q.id === 'quiz_1' || q.id === 'w_quiz_3' || q.id === 'w_quiz_5' ||
            q.id === 'm_quiz_10' || q.id === 'm_quiz_20') {
            q.progress = Math.min(quizCount, q.target); q.done = quizCount >= q.target;
        }
        if (q.id === 'listen_5' || q.id === 'w_listen_10' || q.id === 'w_listen_20' ||
            q.id === 'm_listen_20' || q.id === 'm_listen_50') {
            q.progress = Math.min(listeningQuestionCount, q.target); q.done = listeningQuestionCount >= q.target;
        }
        if (q.id === 'xp_20' || q.id === 'w_xp_200' || q.id === 'w_xp_500' ||
            q.id === 'm_xp_1000' || q.id === 'm_xp_3000') {
            q.progress = Math.min(todayXP, q.target); q.done = todayXP >= q.target;
        }
        if (q.id === 'duration_15' || q.id === 'w_duration_60' || q.id === 'w_duration_120' ||
            q.id === 'm_duration_300' || q.id === 'm_duration_600') {
            q.progress = Math.min(totalDuration, q.target); q.done = totalDuration >= q.target;
        }
        if (q.id === 'w_acc_70' || q.id === 'm_acc_75' || q.id === 'm_acc_90') {
            q.progress = Math.min(avgQuizAcc, q.target); q.done = avgQuizAcc >= q.target;
        }
        if (q.id === 'm_pages_unique') {
            q.progress = Math.min(quizUniquePages.size, q.target); q.done = quizUniquePages.size >= q.target;
        }
        if (q.id === 'm_double_5') {
            q.progress = Math.min(doubleDays, q.target); q.done = doubleDays >= q.target;
        }
        if (q.id === 'm_master_3') {
            q.progress = Math.min(perfectPages.size, q.target); q.done = perfectPages.size >= q.target;
        }
        return q;
    });

    questDoc.all_done = quests.every(q => q.done);
    await questDoc.save();
    return { quests, all_done: questDoc.all_done };
}

router.get('/quests/:student', authenticateToken, async (req, res) => {
    try {
        const { student } = req.params;
        const periods = ['daily', 'weekly', 'monthly'];
        const result = {};
        for (const period of periods) {
            const doc = await getOrCreateQuestDoc(student, period);
            const computed = await computeProgress(period, student, doc);
            result[period] = {
                period_key: doc.period_key,
                quests: computed.quests,
                all_done: computed.all_done,
                bonus_claimed: doc.bonus_claimed || false
            };
        }
        res.json(result);
    } catch (err) {
        console.error('Quest error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

router.post('/quests/claim-bonus', authenticateToken, async (req, res) => {
    try {
        const { period } = req.body;
        if (!['daily', 'weekly', 'monthly'].includes(period)) return res.status(400).json({ message: 'Period invalid' });

        const studentName = req.user?.nama || req.body?.student_name;
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan.' });

        const keyFn = { daily: getDateStr, weekly: getWeekKey, monthly: getMonthKey };
        const period_key = keyFn[period]();

        const questDoc = await DailyQuest.findOne({ student_name: studentName, period, period_key });
        if (!questDoc) return res.status(404).json({ message: 'Belum ada quest periode ini.' });
        if (!questDoc.all_done) return res.status(400).json({ message: 'Selesaikan semua quest dulu!' });
        if (questDoc.bonus_claimed) return res.status(400).json({ message: 'Bonus sudah diklaim.' });

        questDoc.bonus_claimed = true;
        await questDoc.save();

        const bonusXP = { daily: 20, weekly: 50, monthly: 100 }[period] || 0;
        res.json({ message: `Bonus ${bonusXP} XP diklaim!`, bonus_xp: bonusXP });
    } catch (err) {
        console.error('Claim bonus error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
