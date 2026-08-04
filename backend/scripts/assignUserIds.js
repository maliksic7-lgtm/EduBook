const mongoose = require('mongoose');
const crypto = require('crypto');

(async () => {
    await mongoose.connect('mongodb://localhost:27017/edubook');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ user_id: { $exists: false } }).toArray();
    console.log('Users without user_id:', users.length);
    for (const u of users) {
        const uid = 'EDU' + crypto.randomBytes(4).toString('hex').toUpperCase();
        await db.collection('users').updateOne({ _id: u._id }, { $set: { user_id: uid } });
        console.log('Assigned', uid, 'to', u.nama);
    }
    await mongoose.disconnect();
    console.log('Done!');
})();
