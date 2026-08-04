const cacheService = require('../services/cacheService');

function getCacheStatus(req, res) {
    res.json(cacheService.getCacheStatus());
}

async function refreshCache(req, res) {
    try {
        await cacheService.getKnowledgeBase(true);
        res.json({ message: 'Knowledge base cache refreshed successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function clearCache(req, res) {
    cacheService.clearAllCache();
    res.json({ message: 'All caches cleared successfully!' });
}

module.exports = { getCacheStatus, refreshCache, clearCache };
