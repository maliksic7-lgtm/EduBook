// simulate-voice-command.js
//
// Simulator interaktif untuk menguji alur trigger suara & navigasi tanpa
// hardware fisik. Ini implementasi konkret dari strategi "simulasi MQTT"
// yang sudah didiskusikan: mem-publish pesan yang identik dengan yang akan
// dikirim ESP32-S3 asli nanti, supaya seluruh alur device -> server -> web
// dashboard bisa divalidasi lebih dulu sebelum komponen fisik datang.
//
// Cara pakai: node simulators/simulate-voice-command.js
// lalu ketik salah satu: start_voice | stop_voice | next_tab

const mqtt = require('mqtt');
const readline = require('readline');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'edubook/demo';
const MQTT_TOPIC_NAV = `${MQTT_TOPIC_PREFIX}/navbar`;

const VALID_ACTIONS = ['start_voice', 'stop_voice', 'next_tab'];

const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `edubook-simulator-nav-${process.pid}`,
    ...(process.env.MQTT_USERNAME ? { username: process.env.MQTT_USERNAME } : {}),
    ...(process.env.MQTT_PASSWORD ? { password: process.env.MQTT_PASSWORD } : {})
});
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

client.on('connect', () => {
    console.log('🔌 [Simulator Voice Command] Terhubung ke MQTT Broker');
    promptCommand();
});

function promptCommand() {
    rl.question(`\nMasukkan perintah (${VALID_ACTIONS.join(' | ')}), atau "exit": `, (input) => {
        const action = input.trim();

        if (action === 'exit') {
            rl.close();
            client.end();
            return;
        }

        if (!VALID_ACTIONS.includes(action)) {
            console.log('⚠️ Perintah tidak dikenal, coba lagi.');
            return promptCommand();
        }

        client.publish(MQTT_TOPIC_NAV, JSON.stringify({ action }), (err) => {
            if (err) console.error('❌ Gagal kirim:', err.message);
            else console.log(`✅ Terkirim: ${action}`);
            promptCommand();
        });
    });
}

client.on('error', (err) => {
    console.error('❌ [Simulator Voice Command] MQTT Error:', err.message);
});
