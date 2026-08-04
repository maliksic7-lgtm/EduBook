const crypto = require('crypto');

function keysMatch(expected, provided) {
    if (typeof provided !== 'string' || provided.length !== expected.length) return false;

    return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(provided, 'utf8')
    );
}

function requireAdminKey(req, res, next) {
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
        return res.status(503).json({
            message: 'Endpoint administratif dinonaktifkan: ADMIN_API_KEY belum dikonfigurasi.'
        });
    }

    if (!keysMatch(expectedKey, req.get('x-admin-key'))) {
        return res.status(401).json({ message: 'Kunci administratif tidak valid.' });
    }

    next();
}

module.exports = requireAdminKey;
