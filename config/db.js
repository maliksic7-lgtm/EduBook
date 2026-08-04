const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook');
        console.log('✅ MongoDB Terhubung!');
    } catch (err) {
        console.error('❌ Gagal koneksi MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
