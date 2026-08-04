// mqttService.js
// Satu-satunya jalur transport resmi untuk sinyal dari hardware EduBook
// (ESP32-S3) ke server. Keputusan: MQTT-only (bukan HTTP), karena MQTT
// lebih cocok untuk device tertanam yang terhubung lewat internet publik
// (ringan, tahan koneksi tidak stabil, model publish-subscribe standar
// industri IoT). Endpoint HTTP /api/hardware/* yang lama sudah dihapus.
//
// Sebelum hardware fisik tersedia, topic yang sama ini bisa "ditipu" oleh
// simulator (lihat hardware/simulators/) untuk menguji seluruh alur
// device -> server -> web dashboard tanpa komponen fisik.

const mqtt = require('mqtt');
const streamService = require('./streamService');
const aiService = require('./aiService');

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'edubook/demo';
const MQTT_TOPIC_PAGE = `${MQTT_TOPIC_PREFIX}/page`;
const MQTT_TOPIC_NAV = `${MQTT_TOPIC_PREFIX}/navbar`;
const MQTT_TOPIC_VOICE = `${MQTT_TOPIC_PREFIX}/voice`;
const MQTT_TOPIC_AUDIO = `${MQTT_TOPIC_PREFIX}/audio`;
const MQTT_TOPIC_SYNC = `${MQTT_TOPIC_PREFIX}/sync`;

function isValidPage(page) {
    return Number.isInteger(Number(page)) && Number(page) >= 1 && Number(page) <= 10;
}

let mqttClient = null;

function initMqttService() {
    mqttClient = mqtt.connect(MQTT_BROKER_URL, {
        clientId: `edubook-server-${process.pid}`,
        ...(process.env.MQTT_USERNAME ? { username: process.env.MQTT_USERNAME } : {}),
        ...(process.env.MQTT_PASSWORD ? { password: process.env.MQTT_PASSWORD } : {})
    });

    mqttClient.on('connect', () => {
        console.log('🚀 Terhubung ke MQTT Broker!');
        const topics = [MQTT_TOPIC_PAGE, MQTT_TOPIC_NAV, MQTT_TOPIC_VOICE, MQTT_TOPIC_SYNC];
        mqttClient.subscribe(topics, (err) => {
            if (!err) console.log(`Mendengarkan topik: ${topics.join(', ')}`);
        });
    });

    mqttClient.on('message', (topic, message) => {
        const payloadString = message.toString().trim();

        try {
            const data = JSON.parse(payloadString);
            handleParsedMessage(topic, data);
        } catch (e) {
            handleRawMessage(topic, payloadString);
        }
    });

    mqttClient.on('error', (err) => {
        console.error('❌ MQTT Error:', err.code || err.message || err);
    });

    mqttClient.on('offline', () => {
        console.warn('⚠️ MQTT Client offline, mencoba reconnect...');
    });

    return mqttClient;
}

function handleParsedMessage(topic, data) {
    if (topic === MQTT_TOPIC_PAGE && isValidPage(data.page_number)) {
        streamService.broadcast({ type: 'PAGE_CHANGE', page: data.page_number });
        return;
    }

    if (topic === MQTT_TOPIC_NAV) {
        const action = data.action;
        if (action === 'next_tab') streamService.broadcast({ type: 'NAVBAR_TOGGLE' });
        else if (action === 'start_voice') streamService.broadcast({ type: 'START_MIC' });
        else if (action === 'stop_voice') streamService.broadcast({ type: 'STOP_MIC' });
        else if (action === 'web_mode_yes') streamService.broadcast({ type: 'WEB_MODE_ENABLED' });
        else if (action === 'web_mode_no') streamService.broadcast({ type: 'STANDALONE_MODE' });
        return;
    }

    if (topic === MQTT_TOPIC_VOICE) {
        handleVoiceData(data);
        return;
    }

    if (topic === MQTT_TOPIC_SYNC) {
        streamService.broadcast({ type: 'DEVICE_SYNC', data });
        return;
    }
}

async function handleVoiceData(data) {
    const studentName = data.student_name || 'Siswa_EduBook';
    const page = data.page || 1;
    const teksHafalan = data.text_hafalan || '';
    const paragraphId = data.paragraph_id || null;

    streamService.broadcast({ type: 'VOICE_RECEIVED', student_name: studentName, page });

    let textAcuan = '';
    try {
        const Book = require('../models/Book');
        const bookPage = await Book.findOne({ page_number: page });
        if (bookPage && bookPage.paragraphs && bookPage.paragraphs.length > 0) {
            if (paragraphId) {
                const p = bookPage.paragraphs.find(p => p.paragraph_id === paragraphId);
                textAcuan = p ? p.text : bookPage.paragraphs[0].text;
            } else {
                textAcuan = bookPage.paragraphs[0].text;
            }
        }
    } catch (e) {
        console.error('Gagal ambil teks buku:', e.message);
    }

    const result = await aiService.evaluateHafalan(textAcuan, teksHafalan);

    const feedback = {
        feedback: result.feedback_text,
        score: result.score,
        page: page,
        student_name: studentName
    };

    if (mqttClient) {
        mqttClient.publish(MQTT_TOPIC_AUDIO, JSON.stringify(feedback));
    }

    streamService.broadcast({ type: 'VOICE_RESULT', data: feedback });
}

function handleRawMessage(topic, payloadString) {
    if (topic === MQTT_TOPIC_PAGE) {
        const match = payloadString.match(/\d+/);
        if (match && isValidPage(match[0])) {
            streamService.broadcast({ type: 'PAGE_CHANGE', page: parseInt(match[0], 10) });
        }
        return;
    }

    if (topic === MQTT_TOPIC_NAV) {
        if (payloadString.includes('start_voice')) streamService.broadcast({ type: 'START_MIC' });
        else if (payloadString.includes('stop_voice')) streamService.broadcast({ type: 'STOP_MIC' });
        if (payloadString.includes('next_tab')) streamService.broadcast({ type: 'NAVBAR_TOGGLE' });
    }
}

function publishToDevice(topic, data) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(topic, JSON.stringify(data));
    }
}

module.exports = {
    initMqttService,
    MQTT_TOPIC_PAGE, MQTT_TOPIC_NAV, MQTT_TOPIC_VOICE, MQTT_TOPIC_AUDIO, MQTT_TOPIC_SYNC,
    publishToDevice
};
