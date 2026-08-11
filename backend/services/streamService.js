// streamService.js
// Mengelola daftar koneksi SSE (Server-Sent Events) aktif dan menyiarkan event
// ke semua client yang terhubung. Dipisah jadi service supaya mqttService dan
// controller lain (activity, dsb) bisa broadcast tanpa saling import server.js.
//
// Ada dua mode:
//  - broadcast(): kirim ke SEMUA client (event device/mode).
//  - sendToUser(): kirim ke client milik satu user_id tertentu (DM realtime).

const sseClients = new Set();
const sseUserClients = new Map(); // user_id -> Set(res)

function addClient(res) {
    sseClients.add(res);
}

function removeClient(res) {
    sseClients.delete(res);
    sseUserClients.forEach(set => set.delete(res));
}

function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(client => {
        if (client.writableEnded || client.destroyed) {
            sseClients.delete(client);
            return;
        }

        try {
            client.write(payload);
        } catch (error) {
            sseClients.delete(client);
        }
    });
}

function addUserClient(userId, res) {
    if (!userId) return;
    if (!sseUserClients.has(userId)) sseUserClients.set(userId, new Set());
    sseUserClients.get(userId).add(res);
}

function removeUserClient(userId, res) {
    if (!userId || !sseUserClients.has(userId)) return;
    sseUserClients.get(userId).delete(res);
    if (sseUserClients.get(userId).size === 0) sseUserClients.delete(userId);
}

function sendToUser(userId, data) {
    if (!userId || !sseUserClients.has(userId)) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseUserClients.get(userId).forEach(client => {
        if (client.writableEnded || client.destroyed) {
            sseUserClients.get(userId).delete(client);
            return;
        }
        try {
            client.write(payload);
        } catch (error) {
            sseUserClients.get(userId).delete(client);
        }
    });
    if (sseUserClients.has(userId) && sseUserClients.get(userId).size === 0) sseUserClients.delete(userId);
}

module.exports = { addClient, removeClient, broadcast, addUserClient, removeUserClient, sendToUser };
