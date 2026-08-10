const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

function getUserId(req) {
    return req.user?.user_id || '';
}

// Cari user berdasarkan nama
router.get('/users/search', authenticateToken, async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.json([]);
        const me = getUserId(req);
        const users = await User.find({
            $and: [
                { user_id: { $ne: me } },
                { nama: { $regex: q, $options: 'i' } }
            ]
        }).select('nama user_id foto_profil kelas semester').limit(20);
        res.json(users);
    } catch (err) {
        console.error('Search users error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID (public profile, no email)
router.get('/users/by-id/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.userId }).select('nama user_id foto_profil kelas');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json(user);
    } catch (err) {
        console.error('Get user by id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Follow user
router.post('/friendship/follow', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { target_user_id } = req.body;
        if (!target_user_id || me === target_user_id) return res.status(400).json({ message: 'Invalid target' });
        const target = await User.findOne({ user_id: target_user_id });
        if (!target) return res.status(404).json({ message: 'User not found' });
        const existing = await Friendship.findOne({ follower: me, following: target_user_id });
        if (existing) return res.json({ message: 'Already following', following: true });

        await Friendship.create({ follower: me, following: target_user_id });
        await Notification.create({
            user_id: target_user_id,
            type: 'follow',
            from_user_id: me,
            from_user_name: req.user?.nama || 'Someone',
            message: `${req.user?.nama || 'Someone'} mulai mengikutimu!`,
            link: '#'
        });

        // Check if mutual
        const mutual = await Friendship.findOne({ follower: target_user_id, following: me });
        res.json({ message: 'Followed!', following: true, is_friend: !!mutual });
    } catch (err) {
        console.error('Follow error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Unfollow user
router.post('/friendship/unfollow', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { target_user_id } = req.body;
        await Friendship.deleteOne({ follower: me, following: target_user_id });
        res.json({ message: 'Unfollowed', following: false });
    } catch (err) {
        console.error('Unfollow error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get follow status with a user
router.get('/friendship/status/:targetUserId', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const target = req.params.targetUserId;
        const iFollow = !!(await Friendship.findOne({ follower: me, following: target }));
        const theyFollow = !!(await Friendship.findOne({ follower: target, following: me }));
        res.json({ i_follow: iFollow, they_follow: theyFollow, is_friend: iFollow && theyFollow });
    } catch (err) {
        console.error('Friendship status error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get my followers
router.get('/friendship/followers', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const entries = await Friendship.find({ following: me }).sort({ createdAt: -1 }).limit(50);
        const userIds = entries.map(e => e.follower);
        const users = await User.find({ user_id: { $in: userIds } }).select('nama user_id foto_profil kelas');
        const map = {};
        users.forEach(u => map[u.user_id] = u);
        const result = entries.map(e => ({ ...map[e.follower]?.toObject(), followed_at: e.createdAt }));
        res.json(result);
    } catch (err) {
        console.error('Get followers error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get who I follow
router.get('/friendship/following', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const entries = await Friendship.find({ follower: me }).sort({ createdAt: -1 }).limit(50);
        const userIds = entries.map(e => e.following);
        const users = await User.find({ user_id: { $in: userIds } }).select('nama user_id foto_profil kelas');
        const map = {};
        users.forEach(u => map[u.user_id] = u);
        const result = entries.map(e => ({ ...map[e.following]?.toObject(), followed_at: e.createdAt }));
        res.json(result);
    } catch (err) {
        console.error('Get following error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get friends (mutual)
router.get('/friendship/friends', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const iFollow = await Friendship.find({ follower: me }).select('following');
        const followingIds = iFollow.map(e => e.following);
        const theyFollow = await Friendship.find({ follower: { $in: followingIds }, following: me }).select('follower');
        const friendIds = theyFollow.map(e => e.follower);
        const users = await User.find({ user_id: { $in: friendIds } }).select('nama user_id foto_profil kelas');
        res.json(users);
    } catch (err) {
        console.error('Get friends error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get full public profile with stats
router.get('/users/profile/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.userId }).select('nama user_id foto_profil kelas showcase_badges bio last_active title semester jenis_kelamin');
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

        const followerCount = await Friendship.countDocuments({ following: req.params.userId });
        const followingCount = await Friendship.countDocuments({ follower: req.params.userId });

        const Activity = require('../models/Activity');
        const activities = await Activity.find({ student_name: user.nama }).sort({ timestamp: -1 }).limit(500);

        let totalXP = 0;
        let hafalanCount = 0;
        let hafalanSum = 0;
        let quizCount = 0;
        let quizCorrectSum = 0;
        let quizTotalScore = 0;
        const pageScores = {};
        const quizScores = {};
        const historyData = activities.map(a => {
            const isQuiz = a.activity_type === 'quiz';
            const score = a.hafalan_features?.score || 0;
            if (isQuiz) {
                quizCount++;
                quizTotalScore += score;
                const correct = Math.round((score / 100) * (a.quiz_total_questions || 1));
                quizCorrectSum += correct;
                totalXP += correct * 5;
                const p = a.current_page || 1;
                if (!quizScores[p]) quizScores[p] = [];
                quizScores[p].push(score);
            } else {
                hafalanCount++;
                hafalanSum += score;
                totalXP += 15;
                const p = a.current_page || 1;
                if (!pageScores[p]) pageScores[p] = [];
                pageScores[p].push(score);
            }
            return { activity_type: a.activity_type, timestamp: a.timestamp, hafalan_features: a.hafalan_features, current_page: a.current_page };
        });
        const avgHafalan = hafalanCount > 0 ? Math.round(hafalanSum / hafalanCount) : 0;
        const quizPrecision = quizCount > 0 ? Math.round(quizTotalScore / quizCount) : 0;

        const uniqueDates = [...new Set(activities.map(a => new Date(a.timestamp).toDateString()))];
        const rankData = [
            { lv:1, title:'Pemula AIoT Base', min:0 },
            { lv:2, title:'Pengamat AIoT', min:300 },
            { lv:3, title:'Penjelajah AIoT', min:800 },
            { lv:4, title:'Perakit AIoT', min:1500 },
            { lv:5, title:'Builder AIoT', min:2500 },
            { lv:6, title:'Insinyur AIoT', min:4000 },
            { lv:7, title:'Arsitek AIoT', min:6000 },
            { lv:8, title:'Inovator AIoT', min:9000 },
            { lv:9, title:'Master AIoT', min:13000 },
            { lv:10, title:'Grand Master AIoT', min:18000 }
        ];
        let currentLevel = 1;
        let rankTitle = rankData[0].title;
        for (const r of rankData) {
            if (totalXP < r.min) break;
            currentLevel = r.lv;
            rankTitle = r.title;
        }

        res.json({
            user: { nama: user.nama, user_id: user.user_id, foto_profil: user.foto_profil, kelas: user.kelas, showcase_badges: user.showcase_badges || [], bio: user.bio || '', last_active: user.last_active, title: user.title || '', semester: user.semester, jenis_kelamin: user.jenis_kelamin || '' },
            stats: {
                totalXP,
                avgHafalan,
                quizPrecision,
                level: currentLevel,
                rankName: rankTitle,
                hafalanCount,
                quizCount,
                uniqueDays: uniqueDates.length,
                followerCount,
                followingCount
            },
            achievementData: {
                historyData,
                pageScores,
                quizScores,
                uniqueDates,
                totalXP,
                currentLevel,
                avgHafalan,
                analyticsData: { quiz_precision: quizPrecision, total_learning_time: Math.round(activities.reduce((s, a) => s + (a.duration_minutes || 0), 0)) },
                cs: 0,
                bs: 0
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Set showcase badges
router.post('/users/showcase', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { badges } = req.body;
        if (!Array.isArray(badges) || badges.length > 3) return res.status(400).json({ error: 'Maksimal 3 badge' });
        await User.updateOne({ user_id: me }, { $set: { showcase_badges: badges } });
        res.json({ ok: true, badges });
    } catch (err) {
        console.error('Showcase error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get my notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const notifs = await Notification.find({ user_id: me }).sort({ createdAt: -1 }).limit(30);
        res.json(notifs);
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as read
router.post('/notifications/read', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { id } = req.body;
        if (id === 'all') {
            await Notification.updateMany({ user_id: me, read: false }, { read: true });
        } else {
            await Notification.updateOne({ _id: id, user_id: me }, { read: true });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get unread count
router.get('/notifications/unread-count', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const count = await Notification.countDocuments({ user_id: me, read: false });
        res.json({ count });
    } catch (err) {
        console.error('Unread count error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Set title
router.post('/users/set-title', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { title } = req.body;
        if (typeof title !== 'string') return res.status(400).json({ error: 'Title harus string' });
        await User.updateOne({ user_id: me }, { $set: { title: title.trim() } });
        res.json({ ok: true, title: title.trim() });
    } catch (err) {
        console.error('Set title error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Compare two users
router.get('/users/compare/:userId1/:userId2', authenticateToken, async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const users = await User.find({ user_id: { $in: [userId1, userId2] } }).select('nama user_id foto_profil kelas');
        if (users.length !== 2) return res.status(404).json({ error: 'User tidak ditemukan' });

        const Activity = require('../models/Activity');
        const fetchStats = async (user) => {
            const activities = await Activity.find({ student_name: user.nama }).sort({ timestamp: -1 }).limit(500);
            let totalXP = 0, hafalanCount = 0, quizCount = 0, hafalanSum = 0, quizSum = 0;
            activities.forEach(a => {
                const score = a.hafalan_features?.score || 0;
                if (a.activity_type === 'quiz') {
                    quizCount++;
                    quizSum += score;
                    const correct = Math.round((score / 100) * (a.quiz_total_questions || 1));
                    totalXP += correct * 5;
                } else {
                    hafalanCount++;
                    hafalanSum += score;
                    totalXP += 15;
                }
            });
            const uniqueDays = [...new Set(activities.map(a => new Date(a.timestamp).toDateString()))].length;
            const rankData = [
                { lv:1, min:0 },{ lv:2, min:300 },{ lv:3, min:800 },{ lv:4, min:1500 },
                { lv:5, min:2500 },{ lv:6, min:4000 },{ lv:7, min:6000 },
                { lv:8, min:9000 },{ lv:9, min:13000 },{ lv:10, min:18000 }
            ];
            let level = 1;
            for (const r of rankData) { if (totalXP < r.min) break; level = r.lv; }
            return {
                nama: user.nama, foto_profil: user.foto_profil, kelas: user.kelas,
                totalXP, avgHafalan: hafalanCount > 0 ? Math.round(hafalanSum / hafalanCount) : 0,
                quizPrecision: quizCount > 0 ? Math.round(quizSum / quizCount) : 0,
                level, hafalanCount, quizCount, uniqueDays
            };
        };

        const s1 = await fetchStats(users[0]);
        const s2 = await fetchStats(users[1]);
        res.json({ user1: s1, user2: s2 });
    } catch (err) {
        console.error('Compare error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Kirim pesan DM
router.post('/dm/send', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { receiver_id, text } = req.body;
        if (!receiver_id || me === receiver_id) return res.status(400).json({ message: 'Receiver tidak valid' });
        if (!text || !text.trim()) return res.status(400).json({ message: 'Pesan kosong' });
        if (text.trim().length > 2000) return res.status(400).json({ message: 'Pesan terlalu panjang (maks 2000 karakter)' });

        const receiver = await User.findOne({ user_id: receiver_id }).select('nama user_id');
        if (!receiver) return res.status(404).json({ message: 'User tidak ditemukan' });

        const saved = await Message.create({
            sender_id: me,
            sender_name: req.user?.nama || 'Someone',
            receiver_id,
            text: text.trim()
        });

        // Hapus notif lama untuk pembicaraan ini agar tidak menumpuk
        await Notification.deleteMany({ user_id: receiver_id, type: 'message', from_user_id: me });

        await Notification.create({
            user_id: receiver_id,
            type: 'message',
            from_user_id: me,
            from_user_name: req.user?.nama || 'Someone',
            message: `💬 ${req.user?.nama || 'Someone'}: ${text.trim().slice(0, 80)}${text.trim().length > 80 ? '…' : ''}`,
            link: '#'
        });

        res.json({ ok: true, message: saved });
    } catch (err) {
        console.error('Send DM error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Daftar percakapan (dengan pesan terakhir + unread count)
router.get('/dm/conversations', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const messages = await Message.find({ $or: [{ sender_id: me }, { receiver_id: me }] })
            .sort({ createdAt: -1 })
            .limit(500);

        const convMap = {};
        const convOrder = [];
        messages.forEach(m => {
            const otherId = m.sender_id === me ? m.receiver_id : m.sender_id;
            if (!convMap[otherId]) {
                convMap[otherId] = { other_user_id: otherId, last_message: m.text, last_sender_id: m.sender_id, last_at: m.createdAt, unread: 0 };
                convOrder.push(otherId);
            }
            if (m.receiver_id === me && !m.read) convMap[otherId].unread++;
        });

        const otherIds = convOrder;
        const users = await User.find({ user_id: { $in: otherIds } }).select('nama user_id foto_profil kelas');
        const userMap = {};
        users.forEach(u => userMap[u.user_id] = u);

        const result = convOrder.map(id => ({
            ...convMap[id],
            other_user: userMap[id] ? { nama: userMap[id].nama, foto_profil: userMap[id].foto_profil, kelas: userMap[id].kelas } : { nama: '(akun dihapus)' }
        }));

        res.json(result);
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Ambil riwayat chat dengan user lain (mark semua pesan masuk sebagai read)
router.get('/dm/:userId', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const otherId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { sender_id: me, receiver_id: otherId },
                { sender_id: otherId, receiver_id: me }
            ]
        }).sort({ createdAt: 1 }).limit(200);

        await Message.updateMany({ sender_id: otherId, receiver_id: me, read: false }, { read: true });
        await Notification.updateMany({ user_id: me, type: 'message', from_user_id: otherId }, { read: true });

        const user = await User.findOne({ user_id: otherId }).select('nama user_id foto_profil kelas');
        res.json({
            other_user: user ? { nama: user.nama, foto_profil: user.foto_profil, kelas: user.kelas } : null,
            messages
        });
    } catch (err) {
        console.error('Get DM history error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Tandai semua pesan dari user tertentu sebagai read
router.post('/dm/read', authenticateToken, async (req, res) => {
    try {
        const me = getUserId(req);
        const { from_user_id } = req.body;
        if (from_user_id) {
            await Message.updateMany({ sender_id: from_user_id, receiver_id: me, read: false }, { read: true });
            await Notification.updateMany({ user_id: me, type: 'message', from_user_id }, { read: true });
        } else {
            await Message.updateMany({ receiver_id: me, read: false }, { read: true });
            await Notification.updateMany({ user_id: me, type: 'message' }, { read: true });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('DM read error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
