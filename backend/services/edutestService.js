const jwt = require('jsonwebtoken');
const User = require('../models/User');

const rooms = new Map();
let ioRef = null;

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

function findRoomByCode(code) {
    return rooms.get(String(code || '').trim().toUpperCase()) || null;
}

function findRoomByUser(uid) {
    for (const room of rooms.values()) {
        if (room.hostId === uid || room.participants.has(uid)) return room;
    }
    return null;
}

function publicParticipant(room, p) {
    return {
        user_id: p.user_id,
        nama: p.nama,
        foto_profil: p.foto_profil || '',
        answered_count: p.answers.size,
        total_questions: room.questions.length,
        connected: p.connected
    };
}

function publicState(room) {
    return {
        code: room.code,
        title: room.title,
        host_id: room.hostId,
        host_nama: room.hostNama,
        host_foto: room.hostFoto || '',
        phase: room.phase,
        duration_minutes: room.durationMinutes,
        max_users: room.maxUsers,
        question_count: room.questions.length,
        participant_count: room.participants.size,
        started_at: room.startedAt || null,
        ends_at: room.endsAt || null,
        created_at: room.createdAt,
        participants: [...room.participants.values()].map(p => publicParticipant(room, p))
    };
}

function questionPayload(room, index) {
    const q = room.questions[index];
    return {
        code: room.code,
        title: room.title,
        index,
        total: room.questions.length,
        question: q.question,
        options: q.options,
        ends_at: room.endsAt || 0,
        duration_seconds: room.durationMinutes * 60
    };
}

function broadcast(room) {
    if (!ioRef || !rooms.has(room.code)) return;
    ioRef.to(room.code).emit('edutest:state', publicState(room));
}

function participantResult(room, p) {
    let correct = 0;
    room.questions.forEach((q, i) => {
        const answer = p.answers.get(i);
        if (answer !== undefined && norm(answer) === norm(q.options[q.correctIndex])) correct++;
    });
    const review = room.questions.map((q, i) => {
        const answer = p.answers.get(i);
        const correctAnswer = q.options[q.correctIndex];
        return {
            index: i,
            question: q.question,
            options: q.options,
            correct_answer: correctAnswer,
            your_answer: answer === undefined ? null : answer,
            is_correct: answer !== undefined && norm(answer) === norm(correctAnswer)
        };
    });
    return {
        user_id: p.user_id,
        nama: p.nama,
        foto_profil: p.foto_profil || '',
        score: correct * 100,
        correct_count: correct,
        answered_count: p.answers.size,
        total_questions: room.questions.length,
        review
    };
}

function hostResult(room, reason) {
    const rows = [...room.participants.values()].map(p => participantResult(room, p));
    rows.sort((a, b) => b.correct_count - a.correct_count || b.answered_count - a.answered_count);
    rows.forEach((r, i) => { r.rank = i + 1; });
    const summary = room.questions.map((q, i) => {
        const counts = q.options.map(() => 0);
        let answered = 0;
        let correct = 0;
        for (const p of room.participants.values()) {
            const answer = p.answers.get(i);
            if (answer === undefined) continue;
            answered++;
            const idx = q.options.findIndex(o => norm(o) === norm(answer));
            if (idx >= 0) counts[idx]++;
            if (idx === q.correctIndex) correct++;
        }
        return {
            index: i,
            question: q.question,
            options: q.options,
            correct_answer: q.options[q.correctIndex],
            option_counts: counts,
            answered_count: answered,
            correct_count: correct
        };
    });
    return {
        role: 'host',
        code: room.code,
        title: room.title,
        total_questions: room.questions.length,
        participant_count: rows.length,
        results: rows.map(r => ({
            rank: r.rank,
            user_id: r.user_id,
            nama: r.nama,
            foto_profil: r.foto_profil,
            score: r.score,
            correct_count: r.correct_count,
            answered_count: r.answered_count
        })),
        summary,
        finished_reason: reason
    };
}

function finishRoom(room, reason) {
    if (room.phase === 'finished') return;
    room.phase = 'finished';
    room.finishedAt = Date.now();
    room.finishReason = reason;
    const hostData = hostResult(room, reason);
    room.hostPayload = hostData;
    for (const p of room.participants.values()) {
        const data = participantResult(room, p);
        const ranks = hostData.results.find(r => r.user_id === p.user_id);
        const payload = {
            role: 'participant',
            code: room.code,
            title: room.title,
            total_questions: room.questions.length,
            participant_count: hostData.participant_count,
            rank: ranks ? ranks.rank : null,
            score: data.score,
            correct_count: data.correct_count,
            answered_count: data.answered_count,
            review: data.review,
            finished_reason: reason
        };
        p.finalPayload = payload;
        if (p.socketId) ioRef.to(p.socketId).emit('edutest:finished', payload);
    }
    if (room.hostSocketId) ioRef.to(room.hostSocketId).emit('edutest:finished', hostData);
    broadcast(room);
}

function emitCurrentQuestion(room, p) {
    if (!p.socketId || room.phase !== 'active') return;
    const nextIndex = p.answers.size;
    if (nextIndex < room.questions.length) {
        ioRef.to(p.socketId).emit('edutest:question', questionPayload(room, nextIndex));
    } else {
        ioRef.to(p.socketId).emit('edutest:waiting', { message: 'Semua soal sudah dijawab. Menunggu ujian selesai...' });
    }
}

function sanitizeQuestions(input) {
    if (!Array.isArray(input) || input.length < 1) throw new Error('Minimal 1 soal.');
    if (input.length > 50) throw new Error('Maksimal 50 soal per ujian.');
    return input.map((q, i) => {
        const question = String(q?.question || '').trim().slice(0, 1000);
        if (question.length < 3) throw new Error('Soal ' + (i + 1) + ' terlalu pendek.');
        let options = Array.isArray(q?.options)
            ? q.options.map(o => String(o || '').trim().slice(0, 300)).filter(Boolean)
            : [];
        if (options.length < 2 || options.length > 6) throw new Error('Soal ' + (i + 1) + ' harus punya 2-6 opsi.');
        const seen = new Set();
        for (const option of options) {
            if (seen.has(norm(option))) throw new Error('Soal ' + (i + 1) + ' punya opsi duplikat.');
            seen.add(norm(option));
        }
        const correctIndex = Number(q?.correct_index);
        if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
            throw new Error('Jawaban benar soal ' + (i + 1) + ' belum dipilih dengan valid.');
        }
        return { question, options, correctIndex };
    });
}

function attachEduTest(io) {
    ioRef = io;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) return next(new Error('Sesi login tidak ditemukan.'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id)
                .select('nama user_id foto_profil jenjang kelas')
                .lean();
            if (!user) return next(new Error('Akun tidak ditemukan.'));
            socket.data.user = user;
            next();
        } catch (err) {
            next(new Error('Sesi login tidak valid.'));
        }
    });

    io.on('connection', socket => {
        const user = socket.data.user;

        socket.on('edutest:create', (data, ack) => {
            try {
                const existing = findRoomByUser(user.user_id);
                if (existing && existing.phase !== 'finished') {
                    return ack?.({ ok: false, error: 'Kamu masih punya room ujian ' + existing.code + '.' });
                }
                if (existing) rooms.delete(existing.code);
                const title = String(data?.title || '').trim().slice(0, 100);
                if (title.length < 3) return ack?.({ ok: false, error: 'Judul ujian minimal 3 karakter.' });
                const durationMinutes = Number(data?.duration_minutes);
                if (!Number.isInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 180) {
                    return ack?.({ ok: false, error: 'Durasi harus 0-180 menit.' });
                }
                const maxUsers = Number(data?.max_users);
                if (!Number.isInteger(maxUsers) || maxUsers < 0 || maxUsers > 1000) {
                    return ack?.({ ok: false, error: 'Maksimal peserta harus 0-1000 (0 = unlimited).' });
                }
                const questions = sanitizeQuestions(data?.questions);
                const room = {
                    code: genCode(),
                    title,
                    hostId: user.user_id,
                    hostNama: user.nama || 'Host',
                    hostFoto: user.foto_profil || '',
                    hostSocketId: socket.id,
                    phase: 'waiting',
                    durationMinutes,
                    maxUsers,
                    questions,
                    participants: new Map(),
                    createdAt: Date.now(),
                    startedAt: 0,
                    endsAt: 0,
                    finishedAt: 0
                };
                rooms.set(room.code, room);
                socket.join(room.code);
                ack?.({ ok: true, room: publicState(room) });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:join', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code);
                if (!room) return ack?.({ ok: false, error: 'Kode room ujian tidak ditemukan.' });
                if (room.hostId === user.user_id) return ack?.({ ok: false, error: 'Host tidak perlu bergabung ke room sendiri.' });
                const existing = room.participants.get(user.user_id);
                if (!existing) {
                    if (room.phase !== 'waiting') return ack?.({ ok: false, error: 'Ujian sudah dimulai atau selesai.' });
                    if (room.maxUsers > 0 && room.participants.size >= room.maxUsers) {
                        return ack?.({ ok: false, error: 'Room ujian sudah penuh.' });
                    }
                    room.participants.set(user.user_id, {
                        user_id: user.user_id,
                        nama: user.nama || 'Siswa',
                        foto_profil: user.foto_profil || '',
                        socketId: socket.id,
                        connected: true,
                        joinedAt: Date.now(),
                        answers: new Map()
                    });
                } else {
                    existing.connected = true;
                    existing.socketId = socket.id;
                    existing.nama = user.nama || existing.nama;
                    existing.foto_profil = user.foto_profil || existing.foto_profil;
                }
                socket.join(room.code);
                broadcast(room);
                ack?.({ ok: true, role: 'participant', state: publicState(room) });
                if (room.phase === 'active') emitCurrentQuestion(room, room.participants.get(user.user_id));
                if (room.phase === 'finished') {
                    const p = room.participants.get(user.user_id);
                    if (p?.finalPayload) socket.emit('edutest:finished', p.finalPayload);
                }
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:resume', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code);
                if (!room) return ack?.({ ok: false, error: 'Room ujian tidak ditemukan.' });
                if (room.hostId === user.user_id) {
                    room.hostSocketId = socket.id;
                    socket.join(room.code);
                    ack?.({ ok: true, role: 'host', state: publicState(room) });
                    if (room.phase === 'finished' && room.hostPayload) socket.emit('edutest:finished', room.hostPayload);
                    return;
                }
                const p = room.participants.get(user.user_id);
                if (!p) return ack?.({ ok: false, error: 'Kamu bukan peserta room ini.' });
                p.connected = true;
                p.socketId = socket.id;
                socket.join(room.code);
                broadcast(room);
                ack?.({ ok: true, role: 'participant', state: publicState(room) });
                if (room.phase === 'active') emitCurrentQuestion(room, p);
                if (room.phase === 'finished' && p.finalPayload) socket.emit('edutest:finished', p.finalPayload);
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:start', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: false, error: 'Room ujian tidak ditemukan.' });
                if (room.hostId !== user.user_id) return ack?.({ ok: false, error: 'Hanya host yang bisa memulai ujian.' });
                if (room.phase !== 'waiting') return ack?.({ ok: false, error: 'Ujian tidak bisa dimulai sekarang.' });
                if (room.participants.size < 1) return ack?.({ ok: false, error: 'Belum ada peserta yang bergabung.' });
                room.phase = 'active';
                room.startedAt = Date.now();
                room.endsAt = room.durationMinutes > 0 ? room.startedAt + room.durationMinutes * 60000 : 0;
                for (const p of room.participants.values()) emitCurrentQuestion(room, p);
                broadcast(room);
                ack?.({ ok: true, room: publicState(room) });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:answer', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: false, error: 'Room ujian tidak ditemukan.' });
                if (room.phase !== 'active') return ack?.({ ok: false, error: 'Ujian tidak sedang berlangsung.' });
                if (room.endsAt && Date.now() >= room.endsAt) {
                    finishRoom(room, 'time');
                    return ack?.({ ok: false, error: 'Waktu ujian sudah habis.' });
                }
                const p = room.participants.get(user.user_id);
                if (!p) return ack?.({ ok: false, error: 'Kamu bukan peserta ujian ini.' });
                const index = Number(data?.index);
                if (!Number.isInteger(index) || index !== p.answers.size) {
                    return ack?.({ ok: false, error: 'Soal tidak sesuai urutan.' });
                }
                const q = room.questions[index];
                if (!q) return ack?.({ ok: false, error: 'Soal tidak ditemukan.' });
                const choice = String(data?.choice || '');
                if (!q.options.some(o => o === choice)) return ack?.({ ok: false, error: 'Pilihan jawaban tidak valid.' });
                p.answers.set(index, choice);
                ack?.({ ok: true, answered_count: p.answers.size });
                broadcast(room);
                if ([...room.participants.values()].every(x => x.answers.size >= room.questions.length)) {
                    finishRoom(room, 'all_answered');
                    return;
                }
                setTimeout(() => {
                    if (room.phase !== 'active') return;
                    const still = room.participants.get(user.user_id);
                    if (still) emitCurrentQuestion(room, still);
                }, 300);
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:end', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: false, error: 'Room ujian tidak ditemukan.' });
                if (room.hostId !== user.user_id) return ack?.({ ok: false, error: 'Hanya host yang bisa mengakhiri ujian.' });
                if (room.phase !== 'active') return ack?.({ ok: false, error: 'Ujian belum berjalan.' });
                finishRoom(room, 'host');
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('edutest:leave', (data, ack) => {
            try {
                const room = findRoomByCode(data?.code) || findRoomByUser(user.user_id);
                if (!room) return ack?.({ ok: true });
                if (room.hostId === user.user_id) {
                    ioRef.to(room.code).emit('edutest:closed', { message: 'Host menutup room ujian.' });
                    if (room.phase === 'active') finishRoom(room, 'closed');
                    rooms.delete(room.code);
                    socket.leave(room.code);
                    return ack?.({ ok: true });
                }
                const p = room.participants.get(user.user_id);
                if (!p) return ack?.({ ok: true });
                if (room.phase === 'finished') {
                    p.connected = false;
                    socket.leave(room.code);
                    return ack?.({ ok: true });
                }
                room.participants.delete(user.user_id);
                socket.leave(room.code);
                broadcast(room);
                if (room.phase === 'active' && room.participants.size > 0 &&
                    [...room.participants.values()].every(x => x.answers.size >= room.questions.length)) {
                    finishRoom(room, 'all_answered');
                }
                ack?.({ ok: true });
            } catch (err) {
                ack?.({ ok: false, error: err.message });
            }
        });

        socket.on('disconnect', () => {
            for (const room of rooms.values()) {
                if (room.hostId === user.user_id && room.hostSocketId === socket.id) {
                    room.hostSocketId = null;
                    broadcast(room);
                }
                const p = room.participants.get(user.user_id);
                if (p && p.socketId === socket.id) {
                    p.connected = false;
                    p.socketId = null;
                    broadcast(room);
                }
            }
        });
    });

    setInterval(() => {
        const now = Date.now();
        for (const room of [...rooms.values()]) {
            if (room.phase === 'active' && room.endsAt && now >= room.endsAt) {
                finishRoom(room, 'time');
            }
            if (room.phase === 'finished' && now - room.finishedAt > 30 * 60 * 1000) {
                rooms.delete(room.code);
            }
            if (room.phase === 'waiting' && now - room.createdAt > 3 * 60 * 60 * 1000) {
                ioRef.to(room.code).emit('edutest:closed', { message: 'Room ujian kedaluwarsa.' });
                rooms.delete(room.code);
            }
        }
    }, 1000);
}

module.exports = { attachEduTest, rooms };
