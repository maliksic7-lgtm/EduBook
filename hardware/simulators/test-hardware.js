// test-hardware.js
//
// Simulator untuk menirukan sinyal perpindahan halaman dari device ESP32-S3,
// sebelum hardware fisik tersedia. Versi ini publish lewat MQTT (bukan HTTP
// POST seperti versi lama), supaya konsisten dengan keputusan arsitektur:
// MQTT adalah satu-satunya transport resmi sinyal hardware -> server.
//
// Cara pakai: node simulators/test-hardware.js
// (jalankan dari folder backend/, atau sesuaikan require path mqtt jika
// dijalankan dari lokasi lain — pastikan `npm install mqtt` sudah dilakukan
// di folder yang sama)

const mqtt = require('mqtt');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'edubook/demo';
const MQTT_TOPIC_PAGE = `${MQTT_TOPIC_PREFIX}/page`;

const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `edubook-simulator-page-${process.pid}`,
    ...(process.env.MQTT_USERNAME ? { username: process.env.MQTT_USERNAME } : {}),
    ...(process.env.MQTT_PASSWORD ? { password: process.env.MQTT_PASSWORD } : {})
});

const daftarHalaman = [1, 2, 3, 5, 10];
let index = 0;

client.on('connect', () => {
    console.log('🔌 [Simulator ESP32] Terhubung ke MQTT Broker');
    console.log('📡 Memulai simulasi pergantian halaman setiap 7 detik... Perhatikan layar Web Frontend-mu!');

    setInterval(() => {
        const pageNumber = daftarHalaman[index];
        const payload = JSON.stringify({ page_number: pageNumber });

        client.publish(MQTT_TOPIC_PAGE, payload, (err) => {
            if (err) {
                console.error(`❌ Gagal mengirim sinyal Halaman ${pageNumber}:`, err.message);
            } else {
                console.log(`✅ [Simulator ESP32] Sukses mengirim sinyal Halaman ${pageNumber}`);
            }
        });

        index = (index + 1) % daftarHalaman.length; // Berputar kembali ke awal jika sudah halaman terakhir
    }, 7000);
});

client.on('error', (err) => {
    console.error('❌ [Simulator ESP32] MQTT Error:', err.message);
});
