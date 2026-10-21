// cacheService.js
// Mengelola 3 lapis cache: knowledge base (data buku), jawaban AI, dan prompt.
// Dipisah dari server.js supaya logic caching bisa diuji/dipakai ulang terpisah
// dari routing HTTP.

const Book = require('../models/Book');

let knowledgeBaseCache = { data: null, timestamp: null };
const KNOWLEDGE_BASE_TTL = 300000; // 5 menit

const answerCache = new Map();
const ANSWER_CACHE_MAX_SIZE = 100;
const ANSWER_CACHE_TTL = 3600000; // 1 jam

const promptCache = new Map();
const PROMPT_CACHE_MAX_SIZE = 50;

const MAX_KNOWLEDGE_TEXT_LENGTH = 50000;
const MAX_PARAGRAPHS_PER_PAGE = 3;
const MAX_PAGES_SCANNED = 600;

async function getKnowledgeBase(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh &&
        knowledgeBaseCache.data &&
        knowledgeBaseCache.timestamp &&
        (now - knowledgeBaseCache.timestamp) < KNOWLEDGE_BASE_TTL) {
        console.log('📚 Using cached knowledge base');
        return knowledgeBaseCache.data;
    }

    console.log('📚 Fetching fresh knowledge base (streaming cursor)...');

    try {
        // Cursor streaming: dokumen diproses satu per satu dan langsung dibuang,
        // jadi tidak pernah ada seluruh koleksi (apalagi field quiz_questions
        // yang besar) tertampung di memori sekaligus.
        const cursor = Book.find({})
            .select('title page_number subject_id paragraphs.text')
            .sort({ page_number: 1, subject_id: 1 })
            .lean()
            .cursor({ batchSize: 25 });

        let knowledgeBaseText = '';
        let scannedPages = 0;
        let truncated = false;

        for await (const page of cursor) {
            scannedPages++;

            if (knowledgeBaseText.length >= MAX_KNOWLEDGE_TEXT_LENGTH || scannedPages > MAX_PAGES_SCANNED) {
                truncated = true;
                break;
            }

            const title = String(page.title || `Halaman ${page.page_number}`).slice(0, 80);
            knowledgeBaseText += `\n--- ${page.subject_id || 'umum'} | Hal ${page.page_number}: ${title} ---\n`;

            const paragraphs = Array.isArray(page.paragraphs) ? page.paragraphs : [];
            for (const p of paragraphs.slice(0, MAX_PARAGRAPHS_PER_PAGE)) {
                if (!p || typeof p.text !== 'string' || !p.text) continue;
                const remaining = MAX_KNOWLEDGE_TEXT_LENGTH - knowledgeBaseText.length;
                if (remaining <= 0) {
                    truncated = true;
                    break;
                }
                knowledgeBaseText += (p.text.length > remaining ? p.text.slice(0, remaining) : p.text) + '\n';
            }
        }

        knowledgeBaseCache = {
            data: {
                fullText: knowledgeBaseText,
                totalPages: scannedPages,
                lastUpdated: new Date().toISOString(),
                truncated
            },
            timestamp: now
        };

        console.log(`✅ Knowledge base cached (${knowledgeBaseText.length} karakter, ${scannedPages} halaman dipindai${truncated ? ', dipotong' : ''})`);
        return knowledgeBaseCache.data;

    } catch (error) {
        console.error('❌ Error fetching knowledge base:', error);
        if (!knowledgeBaseCache.data) {
            throw error;
        }
        console.log('⚠️ Using stale cache due to error');
        return knowledgeBaseCache.data;
    }
}

function getAnswerCacheKey(question, scope = 'global') {
    return `${scope}|${question.toLowerCase().trim()}`;
}

function getCachedAnswer(question, scope = 'global') {
    const key = getAnswerCacheKey(question, scope);
    const cached = answerCache.get(key);

    if (cached) {
        const now = Date.now();
        if ((now - cached.timestamp) < ANSWER_CACHE_TTL) {
            console.log('✅ Using cached answer for:', question.substring(0, 30) + '...');
            return cached.answer;
        }
        answerCache.delete(key);
        console.log('🗑️ Cache expired for:', question.substring(0, 30) + '...');
    }

    return null;
}

function cacheAnswer(question, answer, scope = 'global') {
    const key = getAnswerCacheKey(question, scope);

    if (answerCache.has(key)) {
        answerCache.set(key, { answer, timestamp: Date.now() });
        console.log('🔄 Updated cache for:', question.substring(0, 30) + '...');
        return;
    }

    if (answerCache.size >= ANSWER_CACHE_MAX_SIZE) {
        const oldestKey = answerCache.keys().next().value;
        answerCache.delete(oldestKey);
        console.log(`🗑️ Cache full, removed oldest: ${oldestKey.substring(0, 20)}...`);
    }

    answerCache.set(key, { answer, timestamp: Date.now() });
    console.log(`💾 Cached answer (${answerCache.size}/${ANSWER_CACHE_MAX_SIZE}):`, question.substring(0, 30) + '...');
}

function getCachedPrompt(question, contextHash) {
    const key = `${question.toLowerCase().trim()}|${contextHash}`;
    return promptCache.get(key) || null;
}

function cachePrompt(question, contextHash, prompt) {
    const key = `${question.toLowerCase().trim()}|${contextHash}`;

    if (promptCache.size >= PROMPT_CACHE_MAX_SIZE) {
        const oldestKey = promptCache.keys().next().value;
        promptCache.delete(oldestKey);
    }

    promptCache.set(key, prompt);
}

function clearAllCache() {
    answerCache.clear();
    promptCache.clear();
    knowledgeBaseCache = { data: null, timestamp: null };
    console.log('🗑️ All caches cleared!');
}

function getCacheStatus() {
    return {
        knowledgeBase: {
            cached: knowledgeBaseCache.data !== null,
            timestamp: knowledgeBaseCache.timestamp,
            pages: knowledgeBaseCache.data ? knowledgeBaseCache.data.totalPages : 0,
            size: knowledgeBaseCache.data ? knowledgeBaseCache.data.fullText.length : 0
        },
        answerCache: {
            size: answerCache.size,
            maxSize: ANSWER_CACHE_MAX_SIZE,
            ttl: ANSWER_CACHE_TTL / 1000 + ' seconds'
        },
        promptCache: {
            size: promptCache.size,
            maxSize: PROMPT_CACHE_MAX_SIZE
        }
    };
}

module.exports = {
    getKnowledgeBase,
    getCachedAnswer,
    cacheAnswer,
    getCachedPrompt,
    cachePrompt,
    clearAllCache,
    getCacheStatus
};
