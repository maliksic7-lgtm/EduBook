// streamService.js
// Mengelola daftar koneksi SSE (Server-Sent Events) aktif dan menyiarkan event
// ke semua client yang terhubung. Dipisah jadi service supaya mqttService dan
// controller lain (activity, dsb) bisa broadcast tanpa saling import server.js.

const sseClients = new Set();

function addClient(res) {
    sseClients.add(res);
}

function removeClient(res) {
    sseClients.delete(res);
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

module.exports = { addClient, removeClient, broadcast };
