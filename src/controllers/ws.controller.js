const { UNKNOWN_USER_ID } = require("../config/auth");
const { WS_TOKEN_AGE, PING_WINDOW, OUTTIME_WINDOW } = require("../config/ws");
const logger = require("../logger");
const { signJWT, generateRandomSafeString } = require("../utils/verification");

class WebSocketController {
    static TaskClientSet = new Set();
    /**
     * 处理 WebSocket 连接关闭事件
     * @param {import("ws").WebSocket} ws - WebSocket 实例
     * @param {import("express").Request} req - HTTP 请求对象
    */
    // eslint-disable-next-line no-unused-vars
    static handleTask(ws, req, data, isBinary) {
        if (typeof data === "string") {
            const msg = JSON.parse(data);
            switch (msg["type"]) {
                case "remind": {
                    const wsi = msg["wsi"], targetList = msg["targetList"];
                    const backJson = { type: "ack", wsi: wsi, ts: Date.now() };
                    ws.send(JSON.stringify(backJson));
                    logger.info(`收到${req?.payload?.id ?? UNKNOWN_USER_ID}的请求, 向指定用户发送提醒`, { req: req.requestId, targetList })
                }; break;
            }
        }
    }
    /**
     * 处理 WebSocket 连接关闭事件
     * @param {import("ws").WebSocket} ws - WebSocket 实例
     * @param {import("express").Request} req - HTTP 请求对象
     * @param {number} code - 关闭连接的状态码
     * @param {string} reason - 关闭连接的原因
     */
    static handleClose(ws, req, code, reason) {
        logger.info(`WebSocket断开连接${req?.payload?.id ?? UNKNOWN_USER_ID} `, { req: req.requestId, code, reason });
    }

    /**
     * 处理 WebSocket 连接关闭事件
     * @param {import("ws").WebSocket} ws - WebSocket 实例
     * @param {import("express").Request} req - HTTP 请求对象
     */
    static openHeartbeat(ws, req) {
        let lastActive = Date.now();
        const id = req?.payload?.id ?? UNKNOWN_USER_ID;
        ws.on('message', (data) => {
            if (typeof data !== "string") return;
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'pong') {
                    lastActive = Date.now();
                    return;
                }
            } catch (e) {
                logger.warn(`${req.path}:${id}心跳检测时出错`, e);
            }
        });

        const interval = setInterval(() => {
            if (Date.now() - lastActive > OUTTIME_WINDOW) {
                logger.info(`${id}的WebSocket心跳无响应, 断开连接`, { req: req.requestId });
                ws.close(1000, 'Inactive');
                clearInterval(interval);
            }
            ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }, PING_WINDOW);
        ws.on("close", () => {
            clearInterval(interval);
        })
    }

    static issueToken(req, res) {
        // eslint-disable-next-line no-unused-vars
        const { exp, jti, iat, ...payload } = req.accessPayload;
        const token = signJWT(payload, {
            expiresIn: WS_TOKEN_AGE,
            jwtid: generateRandomSafeString()
        })
        return res.json({ token });
    }

}
module.exports = WebSocketController;