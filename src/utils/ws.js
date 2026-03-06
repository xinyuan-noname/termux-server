const { UNKNOWN_USER_ID } = require("../config/auth");
const logger = require("../config/logger");
const { PING_WINDOW } = require("../config/ws");

const onMessage = (ws, req, handle) => {
    ws.on("message", (data, isBinary) => {
        handle(ws, req, data, isBinary);
    })
}
const onClose = (ws, req, handle) => {
    ws.on("close", (code, reason) => {
        handle(ws, req, code, reason);
    })
}

/**
 * @param {import("ws").WebSocket} ws - WebSocket 实例
 */
const heartbeat = (ws, req) => {
    let isAlive = true;
    const id = req?.payload?.id ?? UNKNOWN_USER_ID;
    ws.on('pong', () => {
        logger.info(`WebSocket正常连接, ${id}`)
        isAlive = true;
    });
    const interval = setInterval(() => {
        if (isAlive === false) {
            logger.info(`WebSocket心跳无响应, 尝试断开连接, ${id}`)
            clearInterval(interval);
            ws.terminate();
            return;
        }
        isAlive = false;
        ws.ping();
    }, PING_WINDOW);
    ws.on('close', () => {
        clearInterval(interval);
    });
};

module.exports = {
    onMessage,
    onClose,
    heartbeat
};