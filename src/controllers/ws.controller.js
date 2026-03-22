const { UNKNOWN_USER_ID } = require("../config/auth");
const { PENDING_REMIND_KEY } = require("../config/message_config");
const { WS_TOKEN_AGE, OUTTIME_WINDOW, PING_WINDOW } = require("../config/ws");
const logger = require("../logger");
const redis = require("../redis");
const AuthService = require("../service/auth.service");
const MessageServer = require("../service/message.service");
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
        const id = req?.payload?.id ?? UNKNOWN_USER_ID
        WebSocketController.deleteClient("task", id, ws);
        logger.info(`WebSocket断开连接${id} `, { req: req.requestId, code, reason });
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
            ts,
        }
        const messageStr = JSON.stringify(messageJson);
        for (const client of clientList) {
            const { wsList, id } = client;
            for (const socket of wsList) {
                socket.send(messageStr);
            }
            MessageServer.cacheRemind({ data: messageStr, userId: id, sent: true });
        }
        for (const userId of offlineIdList) {
            MessageServer.cacheRemind({ data: messageStr, userId, sent: false });
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
    * @param {import("ws").WebSocket} ws - WebSocket实例
    * @param {import("express").Request} req - HTTP请求对象
    * @param {string} userId - 用户 ID
    */
    static async deliverPendingReminds(ws, req, { id } = {}) {
        if (!id) return;
        const key = PENDING_REMIND_KEY.replace('{userId}', id);
        let pendingCount = 0;
        try {
            const wsList = WebSocketController.TaskClientMap.get(id) || [];
            const activeClients = wsList.filter(ws => ws.readyState === ws.OPEN);
            if (activeClients.length === 0) {
                logger.warn(`用户 ${id} 上线但无活跃连接，跳过提醒推送`, { req: req.requestId });
                return;
            }
            while (true) {
                const msg = await redis.lPop(key);
                if (msg === null) break;
                let sent = false;
                for (const client of activeClients) {
                    try {
                        client.send(msg);
                        sent = true;
                    } catch (err) {
                        logger.warn(`发送失败`, { userId: id, error: err.message });
                    }
                }
                MessageServer.cacheRemind({ data: msg, userId: id, sent });
                pendingCount++;
            }
            logger.info(`向用户${id}补发${pendingCount} 条离线提醒`, { req: req.requestId });
        } catch (err) {
            logger.error(`${id}拉取离线提醒失败`, err);
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
     * @returns {{clientList: {wsList:import("ws").WebSocket[],id:string}[],offlineIdList:string[]}} 
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
            clientList.push({ id, wsList: wsList.filter(ws => ws.readyState === ws.OPEN) });
        }
        return {
            clientList,
            offlineIdList,
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
    /**
     * 从指定类型的客户端集合中删除特定用户的WebSocket连接
     * @param {string} type - 客户端类型 ("task")
     * @param {string} id - 用户ID
     * @param {import("ws").WebSocket} ws - WebSocket实例
     */
    static deleteClient(type, id, ws) {
        switch (type) {
            case "task": {
                const wsList = WebSocketController.TaskClientMap.get(id);
                if (Array.isArray(wsList)) {
                    const index = wsList.indexOf(ws);
                    if (index !== -1) {
                        wsList.splice(index, 1);
                        if (wsList.length === 0) {
                            WebSocketController.TaskClientMap.delete(id);
                        }
                    }
                }
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