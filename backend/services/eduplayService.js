const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');
const GameResult = require('../models/GameResult');
const { getAvailableSubjects } = require('./subjectAccess');
const { mcq, vocab, factbluff } = require('../data/eduplayQuestions');

const GAMES = {
    edubattle: {
        label: 'EduBattle', icon: '⚔️', min: 2, max: 4, questions: 8, time: 15,
        desc: 'Adu cepat jawab soal. Poin dari jawaban benar + kecepatan + streak.',
        tags: ['Kompetitif', 'Pilihan ganda', '2–4 pemain']
    },
    wordrush: {
        label: 'Word Rush', icon: '🔤', min: 2, max: 4, questions: 8, time: 12,
        desc: 'Tebak istilah dari petunjuk/definisi. Pemain tercepat dapat bonus.',
        tags: ['Kosakata', 'Kecepatan', '2–4 pemain']
    },
    braindefense: {
        label: 'Brain Defense', icon: '🛡️', min: 1, max: 4, questions: 10, time: 14,
        desc: 'Jawaban benar memberi energi, jawaban salah mengurangi markas (HP).',
        tags: ['Sains & Logika', 'HP Markas', 'Solo/Co-op']
    },
    knowledgequest: {
        label: 'Knowledge Quest', icon: '🗺️', min: 1, max: 4, questions: 10, time: 18,
        desc: 'Berburu harta karun dengan menyelesaikan tantangan pengetahuan.',
        tags: ['Petualangan', 'Pemahaman', '1–4 pemain']
    },
    factorbluff: {
        label: 'Fact or Bluff', icon: '🤔', min: 2, max: 6, questions: 8, time: 12,
        desc: 'Tentukan Fakta atau Bluff. Latih berpikir kritis dan literasi digital.',
        tags: ['Fakta/Bluff', 'Berpikir kritis', '2–6 pemain']
    },
    escape: {
        label: 'Escape the Classroom', icon: '🚪', min: 2, max: 4, questions: 10, time: 20,
        desc: 'Kerja sama memecahkan teka-teki untuk keluar kelas. Skor tim + waktu.',
        tags: ['Kolaborasi', 'Teka-teki', '2–4 pemain']
    }
};

const rooms = new Map();
const queue = new Map();
const poolCache = new Map();
const BOT_NAMES = ['EduBot Alpha', 'EduBot Beta', 'EduBot Gamma', 'EduBot Delta', 'EduBot Epsilon'];
let ioRef = null;
const queuedAt = new Map();

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pick(arr, n) {
    return shuffle(arr).slice(0, n);
}

function norm(value) {
    return String(value || '').trim().toLowerCase();
}

function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
        code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    } while (rooms.has(code));
    return code;
}

function gameList() {
    return Object.entries(GAMES).map(([id, cfg]) => ({
        id,
        label: cfg.label,
        icon: cfg.icon,
        desc: cfg.desc,
        tags: cfg.tags,
        min_players: cfg.min,
        max_players: cfg.max,
        question_count: cfg.questions,
        time_per_question: cfg.time
    }));
}

function resolveDbAnswer(item) {
    if (!item || !Array.isArray(item.options) || item.options.length < 2) return '';
    const options = item.options.map(o => String(o || '').trim()).filter(Boolean);
    if (!options.length) return '';
    const answer = String(item.correct_answer || '').trim();
    if (!answer) return '';
    const direct = options.find(o => norm(o) === norm(answer));
    if (direct) return direct;
    const letter = answer.toUpperCase();
    if (/^[A-D]$/.test(letter)) {
        const idx = letter.charCodeAt(0) - 65;
        return options[idx] || '';
    }
    return '';
}

async function getBookPool(subjectId, jenjang, kelas, difficulty) {
    const key = `${subjectId}|${jenjang}|${kelas}|${difficulty}`;
    const cached = poolCache.get(key);
    if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.items;

    const filter = { subject_id: subjectId, jenjang, quiz_questions: { $ne: [] } };
    if (difficulty === 'easy') filter.kelas = { $lte: kelas };
    else if (difficulty === 'hard') filter.kelas = { $gte: kelas };
    else filter.kelas = { $gte: Math.max(1, kelas - 1), $lte: Math.min(12, kelas + 1) };

    const pages = await Book.aggregate([
        { $match: filter },
        { $sample: { size: 40 } },
        { $project: { title: 1, page_number: 1, kelas: 1, quiz_questions: 1 } }
    ]);

    const items = [];
    const seen = new Set();
    for (const page of pages) {
        for (const quiz of (page.quiz_questions || [])) {
            const answer = resolveDbAnswer(quiz);
            if (!answer) continue;
            const options = [...new Set(quiz.options.map(o => String(o || '').trim()).filter(Boolean))];
            if (options.length < 2 || !options.some(o => norm(o) === norm(answer))) continue;
            const trimmedOptions = options.length > 4
                ? [answer, ...options.filter(o => norm(o) !== norm(answer))].slice(0, 4)
                : options;
            const qText = String(quiz.question || '').trim();
            if (!qText || seen.has(norm(qText))) continue;
            seen.add(norm(qText));
            items.push({
                q: qText,
                options: trimmedOptions,
                answer,
                exp: `Jawaban: ${answer}. Sumber: buku "${page.title}" halaman ${page.page_number}.`,
                source: `${page.title} (hal. ${page.page_number})`
            });
        }
    }
    poolCache.set(key, { ts: Date.now(), items });
    if (poolCache.size > 300) {
        const oldest = [...poolCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
        if (oldest) poolCache.delete(oldest[0]);
    }
    return items;
}

function staticPoolFor(game) {
    if (game === 'wordrush') {
        return vocab.map(v => ({ q: v.q, options: v.options, answer: v.answer, exp: v.exp, source: 'Paket Kosakata EduPlay' }));
    }
    if (game === 'factorbluff') {
        return factbluff.map(f => ({
            q: f.statement,
            options: ['Fakta', 'Bluff'],
            answer: f.isFact ? 'Fakta' : 'Bluff',
            exp: f.exp,
            source: 'Paket Literasi Digital EduPlay'
        }));
    }
    let cats;
    if (game === 'braindefense') cats = ['sains', 'matematika', 'logika'];
    else if (game === 'knowledgequest') cats = ['umum', 'literasi', 'sejarah', 'geografi', 'sains', 'literasi_digital'];
    else cats = null;
    const list = cats ? mcq.filter(m => cats.includes(m.cat)) : mcq;
    return list.map(m => ({
        q: m.q,
        options: m.options,
        answer: m.answer,
        exp: m.exp,
        source: 'Paket Pengetahuan EduPlay'
    }));
}

function finalizeQuestion(item) {
    const options = shuffle([...new Set(item.options.map(o => String(o || '').trim()).filter(Boolean))]);
    return {
        q: item.q,
        options,
        answer: item.answer,
        exp: item.exp || `Jawaban yang benar: ${item.answer}.`,
        source: item.source || ''
    };
}

async function buildQuestions(room) {
    const cfg = GAMES[room.game];
    let pool = [];
    room.subjectName = '';

    const useSubject = room.topic && room.topic !== 'umum' && room.game !== 'wordrush' && room.game !== 'factorbluff';
    if (useSubject) {
        const subjects = await getAvailableSubjects(room.host);
        const subject = subjects.find(s => s.subject_id === room.topic);
        if (subject) {
            room.subjectName = subject.nama;
            const dbPool = await getBookPool(subject.subject_id, subject.jenjang, room.kelas, room.difficulty);
            pool = pick(dbPool, Math.ceil(cfg.questions * 0.7));
        }
    }

    const statics = shuffle(staticPoolFor(room.game));
    let need = cfg.questions - pool.length;
    const used = new Set(pool.map(p => norm(p.q)));
    for (const item of statics) {
        if (need <= 0) break;
        if (used.has(norm(item.q))) continue;
        pool.push(item);
        used.add(norm(item.q));
        need--;
    }
    if (pool.length < cfg.questions) {
        const filler = statics.length ? statics : staticPoolFor(room.game);
        let i = 0;
        while (pool.length < cfg.questions && filler.length) {
            pool.push(filler[i % filler.length]);
            i++;
        }
    }

    room.questions = shuffle(pool).slice(0, cfg.questions).map(finalizeQuestion);
}

function publicPlayer(p) {
    return {
        user_id: p.user_id,
        nama: p.nama,
        foto_profil: p.foto_profil || '',
        jenjang: p.jenjang,
        kelas: p.kelas,
        score: p.score,
        correct: p.correct,
        streak: p.streak,
        hp: p.hp,
        eliminated: p.eliminated,
        connected: p.connected,
        ready: p.ready,
        bot: p.bot
    };
}

function publicState(room) {
    return {
        code: room.code,
        host_id: room.hostId,
        game: room.game,
        game_label: GAMES[room.game].label,
        game_icon: GAMES[room.game].icon,
        topic: room.topic,
        subject_name: room.subjectName || '',
        difficulty: room.difficulty,
        phase: room.phase,
        question_index: room.qIndex,
        total_questions: room.questions.length,
        time_per_question: GAMES[room.game].time,
        ends_at: room.phase === 'question' ? room.qEndsAt : (room.phase === 'countdown' ? room.countdownEndsAt : (room.phase === 'reveal' ? room.revealEndsAt : null)),
        has_bot: [...room.players.values()].some(p => p.bot),
        players: [...room.players.values()].map(publicPlayer)
    };
}

function publicQuestion(room) {
    if (room.phase !== 'question' || !room.currentPublic) return null;
    return room.currentPublic;
}

function broadcast(room) {
    if (!ioRef || !rooms.has(room.code)) return;
    ioRef.to(room.code).emit('eduplay:state', publicState(room));
}

function addPlayer(room, user, socket) {
    const existing = room.players.get(user.user_id);
    if (existing) {
        existing.connected = true;
        existing.socketId = socket.id;
        existing.nama = user.nama || existing.nama;
        existing.foto_profil = user.foto_profil || existing.foto_profil;
        return existing;
    }
    const player = {
        user_id: user.user_id,
        nama: user.nama || 'Siswa',
        foto_profil: user.foto_profil || '',
        jenjang: user.jenjang || '',
        kelas: Number(user.kelas) || 0,
        score: 0,
        correct: 0,
        streak: 0,
        hp: GAMES[room.game].hp || null,
        eliminated: false,
        connected: true,
        socketId: socket.id,
        ready: false,
        bot: false,
        answeredIndex: -1
    };
    room.players.set(user.user_id, player);
    return player;
}

function addBot(room) {
    const idx = [...room.players.values()].filter(p => p.bot).length;
    const uid = 'bot_' + room.code + '_' + idx;
    const player = {
        user_id: uid,
        nama: BOT_NAMES[idx % BOT_NAMES.length],
        foto_profil: '',
        jenjang: room.host.jenjang,
        kelas: room.kelas,
        score: 0,
        correct: 0,
        streak: 0,
        hp: GAMES[room.game].hp || null,
        eliminated: false,
        connected: true,
        socketId: null,
        ready: true,
        bot: true,
        answeredIndex: -1
    };
    room.players.set(uid, player);
    return player;
}

async function createRoom(user, game, difficulty, topic) {
    if (!GAMES[game]) throw new Error('Game tidak dikenal.');
    const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    let safeTopic = 'umum';
    if (topic && topic !== 'umum') {
        const subjects = await getAvailableSubjects(user);
        if (subjects.some(s => s.subject_id === topic)) safeTopic = topic;
    }
    const room = {
        code: genCode(),
        hostId: user.user_id,
        host: user,
        kelas: Number(user.kelas) || 1,
        game,
        topic: safeTopic,
        difficulty: diff,
        subjectName: '',
        players: new Map(),
        phase: 'waiting',
        questions: [],
        qIndex: -1,
        answers: {},
        history: [],
        lastReveal: null,
        currentPublic: null,
        qStartedAt: 0,
        qEndsAt: 0,
        countdownEndsAt: 0,
        revealEndsAt: 0,
        botTimers: [],
        finishedAt: 0,
        createdAt: Date.now()
    };
    rooms.set(room.code, room);
    return room;
}

function resetPlayers(room) {
    for (const p of room.players.values()) {
        p.score = 0;
        p.correct = 0;
        p.streak = 0;
        p.hp = GAMES[room.game].hp || null;
        p.eliminated = false;
        p.ready = p.bot ? true : false;
        p.answeredIndex = -1;
    }
    room.qIndex = -1;
    room.answers = {};
    room.history = [];
    room.lastReveal = null;
    room.currentPublic = null;
    room.finalPayload = null;
    room.finishedAt = 0;
}

async function startGame(room) {
    const cfg = GAMES[room.game];
    const humans = [...room.players.values()].filter(p => !p.bot);
    if (!humans.length) throw new Error('Room tidak memiliki pemain.');
    while (room.players.size < cfg.min) addBot(room);
    resetPlayers(room);
    await buildQuestions(room);
    room.phase = 'countdown';
    room.countdownEndsAt = Date.now() + 3200;
    broadcast(room);
    ioRef.to(room.code).emit('eduplay:starting', { room: publicState(room) });
}

function scheduleBots(room) {
    const cfg = GAMES[room.game];
    for (const p of room.players.values()) {
        if (!p.bot || p.eliminated) continue;
        const delay = 1800 + Math.random() * Math.max(1500, cfg.time * 1000 - 3500);
        const timer = setTimeout(() => {
            if (room.phase !== 'question') return;
            const q = room.questions[room.qIndex];
            if (!q) return;
            const accuracy = { easy: 0.55, medium: 0.68, hard: 0.78 }[room.difficulty] || 0.65;
            let choice;
            if (Math.random() < accuracy) choice = q.answer;
            else {
                const wrong = q.options.filter(o => norm(o) !== norm(q.answer));
                choice = wrong.length ? wrong[Math.floor(Math.random() * wrong.length)] : q.answer;
            }
            submitAnswer(room, p.user_id, choice, true);
        }, delay);
        room.botTimers.push(timer);
    }
}

function startQuestion(room) {
    const q = room.questions[room.qIndex + 1];
    if (!q) { finishRoom(room); return; }
    const cfg = GAMES[room.game];
    room.qIndex++;
    room.phase = 'question';
    room.answers = {};
    room.qStartedAt = Date.now();
    room.qEndsAt = room.qStartedAt + cfg.time * 1000;
    room.currentPublic = {
        index: room.qIndex,
        total: room.questions.length,
        question: q.q,
        options: q.options,
        ends_at: room.qEndsAt,
        time_per_question: cfg.time,
        game: room.game
    };
    for (const p of room.players.values()) p.answeredIndex = -1;
    room.botTimers.forEach(t => clearTimeout(t));
    room.botTimers = [];
    scheduleBots(room);
    ioRef.to(room.code).emit('eduplay:question', room.currentPublic);
    broadcast(room);
}

function endQuestion(room) {
    if (room.phase !== 'question') return;
    room.botTimers.forEach(t => clearTimeout(t));
    room.botTimers = [];
    const q = room.questions[room.qIndex];
    const reveal = {
        index: room.qIndex,
        correct_answer: q.answer,
        explanation: q.exp,
        source: q.source || '',
        answers: {},
        scores: {}
    };
    for (const p of room.players.values()) {
        const a = room.answers[p.user_id];
        if (!a) p.streak = 0;
        reveal.answers[p.user_id] = a ? { choice: a.choice, correct: a.correct, points: a.points } : { choice: null, correct: false, points: 0 };
        reveal.scores[p.user_id] = { score: p.score, correct: p.correct, streak: p.streak, hp: p.hp, eliminated: p.eliminated };
    }
    room.history.push({ index: room.qIndex, answers: { ...room.answers } });
    room.lastReveal = reveal;
    room.phase = 'reveal';
    room.revealEndsAt = Date.now() + 4500;
    ioRef.to(room.code).emit('eduplay:reveal', reveal);
    broadcast(room);
}

function submitAnswer(room, uid, choice, isBot) {
    if (room.phase !== 'question') return { ok: false, error: 'Soal belum aktif.' };
    const p = room.players.get(uid);
    if (!p) return { ok: false, error: 'Pemain tidak ditemukan.' };
    if (p.eliminated) return { ok: false, error: 'Markas kamu sudah hancur. Tunggu ronde berikutnya.' };
    if (room.answers[uid] || p.answeredIndex === room.qIndex) return { ok: false, error: 'Kamu sudah menjawab soal ini.' };
    const q = room.questions[room.qIndex];
    if (!q || !q.options.includes(choice)) return { ok: false, error: 'Pilihan jawaban tidak valid.' };

    const cfg = GAMES[room.game];
    const remaining = Math.max(0, room.qEndsAt - Date.now());
    const correct = norm(choice) === norm(q.answer);
    let points = 0;
    if (correct) {
        p.streak++;
        const speed = Math.round(50 * (remaining / (cfg.time * 1000)));
        const streakBonus = Math.min(p.streak * 10, 30);
        points = 100 + Math.max(0, speed) + streakBonus;
        if (room.game === 'braindefense') points += 20;
        p.correct++;
    } else {
        p.streak = 0;
        if (room.game === 'braindefense' && p.hp !== null) {
            p.hp = Math.max(0, p.hp - 1);
            if (p.hp === 0) p.eliminated = true;
        }
    }
    p.score += points;
    p.answeredIndex = room.qIndex;
    room.answers[uid] = { choice, correct, points };

    broadcast(room);

    const humans = [...room.players.values()].filter(x => !x.bot && !x.eliminated);
    if (humans.length && humans.every(x => room.answers[x.user_id])) endQuestion(room);
    return { ok: true, correct, points };
}

async function finishRoom(room) {
    if (room.phase === 'finished') return;
    room.phase = 'finished';
    room.finishedAt = Date.now();
    room.currentPublic = null;

    const sorted = [...room.players.values()].sort((a, b) => b.score - a.score || b.correct - a.correct);
    const hasBot = sorted.some(p => p.bot);
    const placementBonus = [50, 30, 15, 5, 0, 0];

    const results = sorted.map((p, i) => ({ ...publicPlayer(p), placement: i + 1 }));
    const humanResults = results.filter(r => !r.bot);

    const review = room.questions.map((q, i) => ({
        index: i,
        question: q.q,
        options: q.options,
        correct_answer: q.answer,
        explanation: q.exp,
        source: q.source || '',
        answers: (room.history[i]?.answers) || {}
    }));

    const tasks = [];
    for (const r of humanResults) {
        const p = room.players.get(r.user_id);
        const base = 20 + p.correct * 8;
        const bonus = placementBonus[r.placement - 1] || 0;
        const teamBonus = GAMES[room.game].team && p.correct >= Math.ceil(room.questions.length * 0.6) ? 10 : 0;
        const xp = base + bonus + teamBonus;
        let delta = 0;
        if (!hasBot) {
            if (r.placement === 1) delta = 25;
            else if (r.placement === 2) delta = 10;
            else if (r.placement === 3) delta = -2;
            else delta = -5;
        }
        p.xpEarned = xp;
        p.ratingDelta = delta;
        r.xp_earned = xp;
        r.rating_delta = delta;
        tasks.push(User.updateOne({ user_id: p.user_id }, { $inc: { game_xp: xp, game_rating: delta, game_matches: 1 } }));
        tasks.push(GameResult.create({
            user_id: p.user_id,
            nama: p.nama,
            game: room.game,
            room_code: room.code,
            topic: room.topic,
            subject_name: room.subjectName || '',
            difficulty: room.difficulty,
            score: p.score,
            correct: p.correct,
            total: room.questions.length,
            placement: r.placement,
            xp_earned: xp,
            rating_delta: delta,
            players_count: humanResults.length,
            has_bot: hasBot
        }));
    }
    await Promise.allSettled(tasks);
    if (!hasBot) {
        await User.updateMany({ game_rating: { $lt: 0 } }, { $set: { game_rating: 0 } }).catch(() => {});
    }

    const payload = {
        room_code: room.code,
        game: room.game,
        game_label: GAMES[room.game].label,
        game_icon: GAMES[room.game].icon,
        topic: room.topic,
        subject_name: room.subjectName || '',
        difficulty: room.difficulty,
        total_questions: room.questions.length,
        has_bot: hasBot,
        results,
        review,
        learning_tip: room.subjectName
            ? `Buka kembali materi ${room.subjectName} untuk memperkuat bagian yang masih salah.`
            : 'Ulangi permainan atau buka Materi Literasi untuk memperdalam topik yang sama.'
    };
    room.finalPayload = payload;
    ioRef.to(room.code).emit('eduplay:finished', payload);
    broadcast(room);
}

function resumeRoom(room, socket) {
    socket.join(room.code);
    socket.emit('eduplay:state', publicState(room));
    if (room.phase === 'question') socket.emit('eduplay:question', room.currentPublic);
    if (room.phase === 'reveal' && room.lastReveal) socket.emit('eduplay:reveal', room.lastReveal);
    if (room.phase === 'finished' && room.finalPayload) socket.emit('eduplay:finished', room.finalPayload);
}

function findRoomByUser(uid) {
    for (const room of rooms.values()) {
        if (room.players.has(uid)) return room;
    }
    return null;
}

function leaveUserRoom(uid, exceptCode) {
    for (const room of [...rooms.values()]) {
        if (room.code === exceptCode) continue;
        if (!room.players.has(uid)) continue;
        room.players.delete(uid);
        const humans = [...room.players.values()].filter(p => !p.bot);
        if (!humans.length) cleanupRoom(room);
        else {
            if (room.hostId === uid) room.hostId = humans[0].user_id;
            broadcast(room);
        }
    }
}

function removeFromQueue(uid) {
    queue.delete(uid);
    queuedAt.delete(uid);
}

function cleanupRoom(room) {
    room.botTimers.forEach(t => clearTimeout(t));
    rooms.delete(room.code);
    queue.forEach((entry, uid) => {
        if (entry.roomCode === room.code) queue.delete(uid);
    });
}

function tick() {
    const now = Date.now();
    for (const room of [...rooms.values()]) {
        if (room.phase === 'countdown' && now >= room.countdownEndsAt && room.questions.length) {
            startQuestion(room);
        } else if (room.phase === 'question' && now >= room.qEndsAt) {
            endQuestion(room);
        } else if (room.phase === 'reveal' && now >= room.revealEndsAt) {
            if (room.qIndex + 1 >= room.questions.length) finishRoom(room);
            else startQuestion(room);
        }

        if (room.phase === 'waiting' || room.phase === 'finished') {
            for (const p of [...room.players.values()]) {
                if (!p.bot && !p.connected && p.disconnectedAt && now - p.disconnectedAt > 60000) {
                    room.players.delete(p.user_id);
                }
            }
            const humans = [...room.players.values()].filter(p => !p.bot);
            if (room.phase === 'waiting' && !humans.length) cleanupRoom(room);
            if (room.phase === 'finished' && now - room.finishedAt > 10 * 60 * 1000) cleanupRoom(room);
        }
    }

    for (const [uid, entry] of [...queue.entries()]) {
        if (!roomMatchStillAlive(entry)) { queue.delete(uid); queuedAt.delete(uid); continue; }
        if (now - entry.at > 8000 && !entry.processing) {
            entry.processing = true;
            queue.delete(uid);
            queuedAt.delete(uid);
            spawnBotMatch(entry).catch(() => {});
        }
    }
}

function roomMatchStillAlive(entry) {
    return !!(ioRef && entry.socketId && ioRef.sockets.sockets.get(entry.socketId));
}

async function spawnBotMatch(entry) {
    const socket = ioRef.sockets.sockets.get(entry.socketId);
    if (!socket) return;
    const user = socket.data.user;
    if (!user) return;
    const existing = findRoomByUser(user.user_id);
    if (existing && existing.phase !== 'finished') { resumeRoom(existing, socket); return; }
    if (existing) leaveUserRoom(user.user_id, null);
    const room = await createRoom(user, entry.game, entry.difficulty, entry.topic);
    leaveUserRoom(user.user_id, room.code);
    addPlayer(room, user, socket);
    socket.join(room.code);
    while (room.players.size < GAMES[room.game].min) addBot(room);
    await startGame(room);
    socket.emit('eduplay:matched', { room: publicState(room), bot: true });
}

async function tryMatch(entry) {
    for (const other of queue.values()) {
        if (other.uid === entry.uid) continue;
        if (other.game !== entry.game || other.difficulty !== entry.difficulty || other.topic !== entry.topic || other.jenjang !== entry.jenjang) continue;
        const socketA = ioRef.sockets.sockets.get(other.socketId);
        const socketB = ioRef.sockets.sockets.get(entry.socketId);
        if (!socketA || !socketB) continue;
        queue.delete(other.uid);
        queuedAt.delete(other.uid);
        queue.delete(entry.uid);
        queuedAt.delete(entry.uid);
        const room = await createRoom(socketA.data.user, entry.game, entry.difficulty, entry.topic);
        leaveUserRoom(socketA.data.user.user_id, room.code);
        leaveUserRoom(socketB.data.user.user_id, room.code);
        addPlayer(room, socketA.data.user, socketA);
        addPlayer(room, socketB.data.user, socketB);
        socketA.join(room.code);
        socketB.join(room.code);
        while (room.players.size < GAMES[room.game].min) addBot(room);
        await startGame(room);
        ioRef.to(room.code).emit('eduplay:matched', { room: publicState(room), bot: room.players.size > 2 && [...room.players.values()].some(p => p.bot) });
        return true;
    }
    return false;
}

function attachEduplay(io) {
    ioRef = io;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) return next(new Error('Token tidak ditemukan. Silakan login.'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id)
                .select('nama user_id jenjang agama jurusan peminatan kelas foto_profil nama_sekolah kelas game_xp game_rating game_matches')
                .lean();
            if (!user) return next(new Error('Akun tidak ditemukan.'));
            socket.data.user = user;
            next();
        } catch (err) {
            next(new Error('Sesi login tidak valid.'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.data.user;

        socket.on('eduplay:resume', (data, ack) => {
            const room = (data && data.code) ? rooms.get(String(data.code).toUpperCase()) : findRoomByUser(user.user_id);
            if (!room) return ack?.({ ok: false, error: 'Room tidak ditemukan atau sudah selesai.' });
            if (!room.players.has(user.user_id)) return ack?.({ ok: false, error: 'Kamu bukan pemain di room ini.' });
            const p = room.players.get(user.user_id);
            p.connected = true;
            p.socketId = socket.id;
            p.disconnectedAt = 0;
            resumeRoom(room, socket);
            broadcast(room);
            ack?.({ ok: true, state: publicState(room) });
        });

        socket.on('eduplay:create', async (data, ack) => {
            try {
                const existing = findRoomByUser(user.user_id);
                if (existing && existing.phase !== 'finished') return ack?.({ ok: false, error: 'Kamu masih berada di room ' + existing.code + '.' });
                leaveUserRoom(user.user_id, null);
                const room = await createRoom(user, data?.game, data?.difficulty, data?.topic);
                addPlayer(room, user, socket);
                socket.join(room.code);
                broadcast(room);
                ack?.({ ok: true, room: publicState(room) });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('eduplay:join', async (data, ack) => {
            try {
                const code = String(data?.code || '').trim().toUpperCase();
                const room = rooms.get(code);
                if (!room) return ack?.({ ok: false, error: 'Kode room tidak ditemukan.' });
                if (room.players.has(user.user_id)) {
                    addPlayer(room, user, socket);
                    socket.join(room.code);
                    resumeRoom(room, socket);
                    broadcast(room);
                    return ack?.({ ok: true, room: publicState(room) });
                }
                if (room.phase !== 'waiting') return ack?.({ ok: false, error: 'Permainan sudah berjalan.' });
                if (room.players.size >= GAMES[room.game].max) return ack?.({ ok: false, error: 'Room sudah penuh.' });
                leaveUserRoom(user.user_id, room.code);
                addPlayer(room, user, socket);
                socket.join(room.code);
                broadcast(room);
                ack?.({ ok: true, room: publicState(room) });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('eduplay:quick', async (data, ack) => {
            try {
                const game = data?.game;
                if (!GAMES[game]) return ack?.({ ok: false, error: 'Game tidak dikenal.' });
                const difficulty = ['easy', 'medium', 'hard'].includes(data?.difficulty) ? data.difficulty : 'medium';
                const topic = String(data?.topic || 'umum');
                const existing = findRoomByUser(user.user_id);
                if (existing && existing.phase !== 'finished') {
                    resumeRoom(existing, socket);
                    return ack?.({ ok: true, room: publicState(existing), resumed: true });
                }
                if (existing) leaveUserRoom(user.user_id, null);
                removeFromQueue(user.user_id);
                const entry = {
                    uid: user.user_id,
                    game,
                    difficulty,
                    topic,
                    jenjang: user.jenjang,
                    at: Date.now(),
                    socketId: socket.id,
                    processing: false
                };
                const matched = await tryMatch(entry);
                if (!matched) {
                    queue.set(user.user_id, entry);
                    queuedAt.set(user.user_id, Date.now());
                    ack?.({ ok: true, queued: true, message: 'Mencari lawan... bot latihan akan disiapkan jika tidak ada lawan dalam 8 detik.' });
                } else {
                    ack?.({ ok: true, matched: true });
                }
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('eduplay:ready', (data, ack) => {
            const room = findRoomByUser(user.user_id);
            if (!room) return ack?.({ ok: false, error: 'Kamu tidak berada di room.' });
            const p = room.players.get(user.user_id);
            if (!p) return ack?.({ ok: false, error: 'Pemain tidak ditemukan.' });
            p.ready = !!data?.ready;
            broadcast(room);
            ack?.({ ok: true, ready: p.ready });
        });

        socket.on('eduplay:start', async (data, ack) => {
            try {
                const room = rooms.get(String(data?.code || '').trim().toUpperCase()) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: false, error: 'Room tidak ditemukan.' });
                if (room.hostId !== user.user_id) return ack?.({ ok: false, error: 'Hanya host yang bisa memulai.' });
                if (room.phase !== 'waiting') return ack?.({ ok: false, error: 'Permainan tidak bisa dimulai sekarang.' });
                await startGame(room);
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('eduplay:answer', (data, ack) => {
            const room = findRoomByUser(user.user_id);
            if (!room) return ack?.({ ok: false, error: 'Room tidak ditemukan.' });
            const result = submitAnswer(room, user.user_id, data?.choice, false);
            ack?.(result);
        });

        socket.on('eduplay:rematch', async (data, ack) => {
            try {
                const room = rooms.get(String(data?.code || '').trim().toUpperCase()) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: false, error: 'Room tidak ditemukan.' });
                if (room.hostId !== user.user_id) return ack?.({ ok: false, error: 'Hanya host yang bisa rematch.' });
                if (room.phase !== 'finished') return ack?.({ ok: false, error: 'Ronde belum selesai.' });
                await startGame(room);
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('eduplay:leave', (data, ack) => {
            removeFromQueue(user.user_id);
            const room = rooms.get(String(data?.code || '').trim().toUpperCase()) || findRoomByUser(user.user_id);
            if (!room) return ack?.({ ok: true });
            room.players.delete(user.user_id);
            socket.leave(room.code);
            const humans = [...room.players.values()].filter(p => !p.bot);
            if (!humans.length) {
                cleanupRoom(room);
            } else {
                if (room.hostId === user.user_id) room.hostId = humans[0].user_id;
                broadcast(room);
            }
            ack?.({ ok: true });
        });

        socket.on('disconnect', () => {
            removeFromQueue(user.user_id);
            for (const room of rooms.values()) {
                const p = room.players.get(user.user_id);
                if (p && p.socketId === socket.id) {
                    p.connected = false;
                    p.socketId = null;
                    p.disconnectedAt = Date.now();
                    broadcast(room);
                }
            }
        });
    });

    setInterval(tick, 500);
}

module.exports = { attachEduplay, gameList, GAMES };
