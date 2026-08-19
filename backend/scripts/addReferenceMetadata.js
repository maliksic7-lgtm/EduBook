// addReferenceMetadata.js
// Meng-update field reference_author / reference_title / reference_year
// pada dokumen buku yang sudah ada DI TANPA menghapus data lain
// (kuis, paragraf, gambar, dll). Aman untuk database yang sedang dipakai.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Book = require('../models/Book');

const references = {
    1: {
        reference_author: "Haidar Shaddam Fawwaz Fadhlullah dkk",
        reference_title: "Pengaruh Internet of Things (IoT) dalam Industri",
        reference_year: "2024"
    },
    2: {
        reference_author: "Anis Wahyumulyaning Tiyas dkk",
        reference_title: "Peningkatan Akurasi Sensor Suhu dan Kelembaban DHT11 dengan Kalibrasi Suhu Berbasis IoT pada Platform ThingSpeak",
        reference_year: "2025"
    },
    3: {
        reference_author: "Muhammad Aqsha Rizki Sugiarto dkk",
        reference_title: "Implementasi Sistem Pemberian Pakan Ikan Hias Otomatis Menggunakan ESP32 Berbasis IoT (Internet of Things)",
        reference_year: "2024"
    },
    4: {
        reference_author: "Hermansyah dkk",
        reference_title: "Sistem Kendali Jarak Jauh Beban Listrik Rumah Tangga Berbasis Internet of Things (IoT)",
        reference_year: "2023"
    },
    5: {
        reference_author: "Sahlan",
        reference_title: "Mengenal Protokol MQTT dalam Internet of Things (IoT)",
        reference_year: "2025"
    },
    6: {
        reference_author: "Atista Dwi Zahra",
        reference_title: "Penerapan Cloud IoT dalam Platform Blynk, Firebase, dan ThingSpeak untuk Proyek Internet of Things",
        reference_year: "2023"
    },
    7: {
        reference_author: "Rita Puspita Sari",
        reference_title: "IoT & AI: Revolusi Teknologi yang Mengubah Industri 2025",
        reference_year: "2025"
    },
    8: {
        reference_author: "Panitia SIML 2026",
        reference_title: "International Conference on Smart Computing, IoT and Machine Learning (SIML 2026)",
        reference_year: "2026"
    },
    9: {
        reference_author: "Mufid Ridlo Effendi dkk",
        reference_title: "Sistem Smart Home Berbasis IoT dengan Integrasi Pengendalian Suara dan Aplikasi Smartphone",
        reference_year: "2025"
    },
    10: {
        reference_author: "Cosmas Widyawan",
        reference_title: "Indonesia's AI & IoT Market in 2026: From Pilot Projects to Core Infrastructure",
        reference_year: "2026"
    }
};

(async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edubook';
        await mongoose.connect(mongoUri);
        console.log('✅ Terhubung ke MongoDB');

        let updated = 0;
        for (const [pageNumber, meta] of Object.entries(references)) {
            const res = await Book.updateOne(
                { page_number: Number(pageNumber) },
                {
                    $set: {
                        reference_author: meta.reference_author,
                        reference_title: meta.reference_title,
                        reference_year: meta.reference_year
                    }
                }
            );
            if (res.modifiedCount > 0 || res.matchedCount > 0) {
                updated++;
                console.log(`  Halaman ${pageNumber}: metadata referensi diperbarui`);
            } else {
                console.warn(`  Halaman ${pageNumber}: tidak ditemukan (skip)`);
            }
        }

        console.log(`✅ ${updated} halaman selesai diperbarui. Data lain tidak disentuh.`);
    } catch (err) {
        console.error('❌ Gagal:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
