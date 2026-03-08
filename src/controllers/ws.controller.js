const { UNKNOWN_USER_ID } = require("../config/auth");
const { WS_TOKEN_AGE, PING_WINDOW, OUTTIME_WINDOW, PENDING_REMIND_KEY } = require("../config/ws");
const logger = require("../logger");
const redis = require("../redis");
const AuthService = require("../service/auth.service");
const { signJWT, generateRandomSafeString } = require("../utils/verification");

class WebSocketController {
    /**
     * @type {Map<string,import("ws").WebSocket[]>}
     */
    static TaskClientMap = new Map();
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
                    const { wsi, content, level, ts, targetList } = msg;
                    const backJson = { type: "ack", wsi: wsi, ts: Date.now() };
                    ws.send(JSON.stringify(backJson));
                    WebSocketController.sendRemind(ws, req, { content, level, ts, targetList });
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
     * 发送提醒消息给指定用户列表
     * @param {import("ws").WebSocket} ws - WebSocket实例
     * @param {import("express").Request} req - HTTP请求对象
     * @param {Object} options - 消息选项
     * @param {string} options.content - 提醒内容
     * @param {number} options.level - 提醒级别，默认为0
     * @param {Array} options.targetList - 目标用户ID列表，默认为空数组
     * @param {number} options.ts - 时间戳
     */
    static async sendRemind(ws, req, { content = "", level = 0, targetList = [], ts = Date.now() } = {}) {
        const id = req?.payload?.id ?? UNKNOWN_USER_ID
        const { clientList, offlineIdList } = WebSocketController.getClientFromIdList(WebSocketController.TaskClientMap, targetList);
        const messageJson = {
            type: "remind",
            content,
            level,
            source: JSON.stringify({ id, username: AuthService.getUsernameById(id) }),
            ts
        }
        const messageStr = JSON.stringify(messageJson);
        for (const client of clientList) {
            client.send(messageStr);
        }
        for (const userId of offlineIdList) {
            const key = PENDING_REMIND_KEY.replace('{userId}', userId);
            await redis.lpush(key, messageStr);
            await redis.ltrim(key, 0, 49);
            await redis.expire(key, 3 * 24 * 3600);
        }
        logger.info(`收到${id}的请求, 向指定用户发送提醒`, {
            req: req.requestId,
            onlineCount: clientList.length,
            offlineCount: offlineIdList.length,
            targetList
        });
    }

    /**
    * 用户上线时，拉取并清空离线提醒队列
    * @param {string} userId - 用户 ID
    */
    static async deliverPendingReminds(ws, req, { id } = {}) {
        if (!id) return;

        const key = PENDING_REMIND_KEY.replace('{userId}', id);
        let pendingCount = 0;

        try {
            const messages = await redis.lrange(key, 0, -1);
            if (messages.length === 0) return;

            const wsList = WebSocketController.TaskClientMap.get(id) || [];
            const activeClients = wsList.filter(ws =>
                ws.readyState === WebSocket.OPEN
            );

            if (activeClients.length === 0) {
                logger.warn(`用户 ${id} 上线但无活跃连接，跳过提醒推送`, { req: req.requestId });
                return;
            }
            for (let i = messages.length - 1; i >= 0; i--) {
                const msgStr = messages[i];
                for (const client of activeClients) {
                    try {
                        client.send(msgStr);
                    } catch (err) {
                        logger.warn(`向用户 ${id} 发送离线提醒失败`, { err, req: req.requestId });
                    }
                }
            }
            pendingCount = messages.length;
            await redis.del(key);
            logger.info(`向用户 ${id} 补发 ${pendingCount} 条离线提醒`, { req: req.requestId });
        } catch (err) {
            logger.error(`拉取离线提醒失败`, { id, err, req: req.requestId });
        }
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

    /**
     * 根据ID列表从集合中获取客户端
     * @param {Map<string,import("ws").WebSocket[]>} map - 包含客户端的集合
     * @param {Array<string>} idList - 要查找的客户端ID列表
     * @returns {{clientList: import("ws").WebSocket[],offlineIdList:string[]}} 
     */
    static getClientFromIdList(map, idList) {
        const clientList = [], offlineIdList = [];
        for (const id of idList) {
            const wsList = map.get(id);
            if (!Array.isArray(wsList)) {
                offlineIdList.push(id);
                continue;
            }
            if (wsList.length === 0) {
                offlineIdList.push(id);
                continue;
            }
            clientList.push(...wsList.filter(e => e.OPEN))
        }
        return {
            clientList,
            offlineIdList
        };
    }

    static addClient(type, id, ws) {
        switch (type) {
            case "task": {
                let wsList = WebSocketController.TaskClientMap.get(id);
                if (!Array.isArray(wsList)) {
                    wsList = [];
                    WebSocketController.TaskClientMap.set(id, wsList);
                }
                wsList.push(ws);
            }; break;
        }
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