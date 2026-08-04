// cacheService.js
// Mengelola 3 lapis cache: knowledge base (data buku), jawaban AI, dan prompt.
// Dipisah dari server.js supaya logic caching bisa diuji/dipakai ulang terpisah
// dari routing HTTP.

const Book = require('../models/Book');

let knowledgeBaseCache = { data: null, timestamp: null, pages: null };
const KNOWLEDGE_BASE_TTL = 300000; // 5 menit

const answerCache = new Map();
const ANSWER_CACHE_MAX_SIZE = 100;
const ANSWER_CACHE_TTL = 3600000; // 1 jam

const promptCache = new Map();
const PROMPT_CACHE_MAX_SIZE = 50;

async function getKnowledgeBase(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh &&
        knowledgeBaseCache.data &&
        knowledgeBaseCache.timestamp &&
        (now - knowledgeBaseCache.timestamp) < KNOWLEDGE_BASE_TTL) {
        console.log('📚 Using cached knowledge base');
        return knowledgeBaseCache.data;
    }

    console.log('📚 Fetching fresh knowledge base from database...');

    try {
        const allPages = await Book.find({}).sort({ page_number: 1 });

        let knowledgeBaseText = "";
        const pageTitles = {};
        const quizData = {};

        allPages.forEach(page => {
            pageTitles[page.page_number] = page.title || `Halaman ${page.page_number}`;

            if (page.quiz_questions && page.quiz_questions.length > 0) {
                quizData[page.page_number] = page.quiz_questions.length;
            }

            knowledgeBaseText += `\n--- Halaman ${page.page_number}: ${page.title} ---\n`;
            if (page.paragraphs && page.paragraphs.length > 0) {
                page.paragraphs.forEach(p => {
                    knowledgeBaseText += `${p.text} \n`;
                });
            }
        });

        knowledgeBaseCache = {
            data: {
                fullText: knowledgeBaseText,
                pageTitles,
                quizData,
                totalPages: allPages.length,
                lastUpdated: new Date().toISOString()
            },
            timestamp: now,
            pages: allPages
        };

        console.log(`✅ Knowledge base cached (${knowledgeBaseText.length} characters, ${allPages.length} pages)`);
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
    knowledgeBaseCache = { data: null, timestamp: null, pages: null };
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
