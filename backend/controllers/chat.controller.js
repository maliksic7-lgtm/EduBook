const ChatHistory = require('../models/ChatHistory');
const cacheService = require('../services/cacheService');
const aiService = require('../services/aiService');
const fallbackService = require('../services/fallbackService');
const crypto = require('crypto');

function getStudentName(req) {
    if (req.user?.nama) return req.user.nama;
    const value = req.body?.student_name || req.params?.student_name;
    if (typeof value !== 'string') return null;
    const name = value.trim();
    return name.length >= 1 && name.length <= 100 ? name : null;
}

function normalizeStudentName(value) {
    if (typeof value !== 'string') return null;
    const studentName = value.trim();
    return studentName.length >= 1 && studentName.length <= 100 ? studentName : null;
}

function getGenderCall(req) {
    const gender = req.user?.jenis_kelamin;
    if (gender === 'P') return 'sis';
    if (gender === 'L') return 'bro';
    return 'sobat';
}

function normalizeMessage(value) {
    if (typeof value !== 'string') return null;
    const message = value.trim();
    return message.length >= 1 && message.length <= 4000 ? message : null;
}

function buildConversationContext(messages) {
    const lastMessages = messages.slice(-5);
    const contextText = lastMessages.map(message => {
        const role = message.role === 'user' ? 'Siswa' : 'EduBot';
        return `${role}: ${message.text}`;
    }).join('\n');
    const contextHash = crypto.createHash('sha256')
        .update(lastMessages.map(message => `${message.role}:${message.text}`).join('|'))
        .digest('hex');

    return { contextText, contextHash };
}

async function getChatSessions(req, res) {
    try {
        const studentName = getStudentName(req);
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan' });
        const sessions = await ChatHistory.find({ student_name: studentName })
            .sort({ updated_at: -1 })
            .select('session_id title created_at updated_at message_count');

        res.json(sessions);
    } catch (err) {
        console.error("Error getting chat sessions:", err);
        res.status(500).json({ error: err.message });
    }
}

async function getChatSession(req, res) {
    try {
        const studentName = getStudentName(req);
        const { session_id } = req.params;
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan' });
        const session = await ChatHistory.findOne({ student_name: studentName, session_id });

        if (!session) return res.status(404).json({ message: 'Sesi chat tidak ditemukan' });

        res.json(session);
    } catch (err) {
        console.error("Error getting chat session:", err);
        res.status(500).json({ error: err.message });
    }
}

async function createChatSession(req, res) {
    try {
        const { title, created_at } = req.body;
        const studentName = getStudentName(req);

        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan' });

        const dynamicDate = created_at ? new Date(created_at) : new Date();
        if (Number.isNaN(dynamicDate.getTime())) {
            return res.status(400).json({ message: 'created_at tidak valid.' });
        }

        const session_id = `sess_${crypto.randomUUID()}`;

        const newSession = new ChatHistory({
            student_name: studentName,
            session_id,
            title: typeof title === 'string' && title.trim()
                ? title.trim().slice(0, 120)
                : `Obrolan ${dynamicDate.toLocaleDateString('id-ID')}`,
            messages: [{
                role: 'bot',
                text: `Halo ${getGenderCall(req)}! Aku EduBot, tutor pintar pribadi kamu. Ada materi dari isi buku EduBook kita yang bikin kamu penasaran? Tanya aja langsung pakai ketik atau pencet tombol mic di bawah ya! 🚀`
            }],
            message_count: 1,
            created_at: dynamicDate,
            updated_at: dynamicDate
        });

        await newSession.save();
        res.status(201).json(newSession);
    } catch (err) {
        console.error("Error creating chat session:", err);
        res.status(500).json({ error: err.message });
    }
}

async function deleteChatSession(req, res) {
    try {
        const studentName = getStudentName(req);
        const { session_id } = req.params;
        if (!studentName) return res.status(400).json({ message: 'student_name diperlukan' });
        const result = await ChatHistory.deleteOne({ student_name: studentName, session_id });

        if (result.deletedCount === 0) return res.status(404).json({ message: 'Sesi chat tidak ditemukan' });

        res.json({ message: 'Sesi chat berhasil dihapus' });
    } catch (err) {
        console.error("Error deleting chat session:", err);
        res.status(500).json({ error: err.message });
    }
}

async function sendChatMessage(req, res) {
    const studentName = getStudentName(req);
    const sessionId = typeof req.body.session_id === 'string' ? req.body.session_id.trim() : '';
    const message = normalizeMessage(req.body.message);

    console.log(`📨 Received message: student=${studentName}, session=${sessionId}, msg="${message}"`);

    if (!studentName || !sessionId || !message) {
        return res.status(400).json({ message: 'student_name, session_id, dan message diperlukan' });
    }

    let session;
    try {
        session = await ChatHistory.findOne({ student_name: studentName, session_id: sessionId });
        if (!session) return res.status(404).json({ message: 'Sesi chat tidak ditemukan' });

        const previousContext = buildConversationContext(session.messages);
        const cacheScope = `${studentName}|${sessionId}|${previousContext.contextHash}`;
        const cachedAnswer = cacheService.getCachedAnswer(message, cacheScope);

        if (cachedAnswer) {
            console.log('✅ Returning cached answer');

            session.messages.push({ role: 'user', text: message });
            session.messages.push({ role: 'bot', text: cachedAnswer });
            session.message_count += 2;
            session.updated_at = new Date();
            await session.save();

            return res.json({
                reply: cachedAnswer,
                session_id: sessionId,
                message_count: session.message_count,
                title: session.title,
                source: 'cache'
            });
        }

        console.log(`✅ Session found: ${session.title}, messages: ${session.messages.length}`);

        session.messages.push({ role: 'user', text: message });
        session.message_count += 1;
        session.updated_at = new Date();
        await session.save();
        console.log(`✅ User message saved`);

        const currentContext = buildConversationContext(session.messages.slice(0, -1));
        const contextText = currentContext.contextText;
        const currentContextHash = currentContext.contextHash;
        const currentCacheScope = `${studentName}|${sessionId}|${currentContextHash}`;

        console.log('📚 Getting knowledge base from cache...');
        const knowledgeBase = await cacheService.getKnowledgeBase();

        let promptSystem = cacheService.getCachedPrompt(message, currentContextHash);
        if (!promptSystem) {
            promptSystem = `Anda adalah "EduBot", asisten AI Tutor untuk "EduBook" (Samsung Innovation Campus Batch 8).
Gunakan bahasa yang ramah dan santun. Panggil siswa dengan "kamu" (jangan gunakan kata "lo", "gue", "gw", "lu"). Jika perlu menyapa, gunakan kata panggilan "${getGenderCall(req)}" untuk siswa ini.

${contextText ? `🔴 KONTEKS PERCAKAPAN SEBELUMNYA:\n${contextText}` : ''}

📚 KNOWLEDGE BASE:
${knowledgeBase.fullText.substring(0, 8000)}

Pertanyaan: "${message}"`;

            cacheService.cachePrompt(message, currentContextHash, promptSystem);
        } else {
            console.log('✅ Using cached prompt');
        }

        let reply;
        try {
            reply = await aiService.callGeminiWithRetry(promptSystem, 3);
            console.log('✅ Using AI response');
            cacheService.cacheAnswer(message, reply, currentCacheScope);
        } catch (error) {
            console.log('⚠️ AI failed, using fallback knowledge base');
            reply = fallbackService.getFallbackResponse(message);
            cacheService.cacheAnswer(message, reply, currentCacheScope);
        }

        session.messages.push({ role: 'bot', text: reply });
        session.message_count += 1;
        session.updated_at = new Date();

        if (session.messages.length <= 3) {
            const firstQuestion = session.messages.find(m => m.role === 'user');
            if (firstQuestion) {
                session.title = firstQuestion.text.substring(0, 40) + (firstQuestion.text.length > 40 ? '...' : '');
            }
        }

        await session.save();
        console.log(`✅ Bot reply saved`);

        res.json({
            reply,
            session_id: session.session_id,
            message_count: session.message_count,
            title: session.title,
            source: 'ai'
        });

    } catch (err) {
        console.error('🚨 EduBot Chat Error:', err);
        const fallbackReply = fallbackService.getFallbackResponse(message || 'Halo');

        try {
            const session = await ChatHistory.findOne({
                student_name: studentName,
                session_id: sessionId
            });
            if (session) {
                session.messages.push({ role: 'bot', text: fallbackReply });
                session.message_count += 1;
                session.updated_at = new Date();
                await session.save();
            }
        } catch (dbErr) {
            console.error('Error saving fallback to DB:', dbErr);
        }

        res.json({
            reply: fallbackReply,
            session_id: sessionId,
            message_count: 0,
            title: 'Obrolan',
            source: 'emergency-fallback'
        });
    }
}

module.exports = {
    getChatSessions,
    getChatSession,
    createChatSession,
    deleteChatSession,
    sendChatMessage
};
