const sseClients = new Set();
const sseUserClients = new Map();

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

const heartbeatInterval = setInterval(() => {
    sseClients.forEach(client => {
        if (client.writableEnded || client.destroyed) {
            sseClients.delete(client);
            return;
        }
        try {
            client.write(': heartbeat\n\n');
        } catch (error) {
            sseClients.delete(client);
        }
    });
    sseUserClients.forEach((set, userId) => {
        set.forEach(client => {
            if (client.writableEnded || client.destroyed) {
                set.delete(client);
                return;
            }
            try {
                client.write(': heartbeat\n\n');
            } catch (error) {
                set.delete(client);
            }
        });
        if (set.size === 0) sseUserClients.delete(userId);
    });
}, 30000);

heartbeatInterval.unref();

module.exports = { addClient, removeClient, broadcast, addUserClient, removeUserClient, sendToUser };
