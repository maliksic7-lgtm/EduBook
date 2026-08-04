const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Terhubung!');
    } catch (err) {
        console.error('❌ Gagal koneksi MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
