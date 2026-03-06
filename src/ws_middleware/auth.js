const logger = require("../logger");
const AuthService = require("../service/auth.service");
const { fullIpToSafeIp } = require("../utils/ip");
const { generateRandomSafeString } = require("../utils/verification");

/**
 * 
 * @param {import("ws").WebSocket} ws 
 * @param {import("express").Request} req 
 * @param {Function} next 
 */
const auth = async (ws, req, next) => {
    const { headers, ip, query, } = req;
    const requestId = generateRandomSafeString(16);
    req.requestId = requestId;
    const sIp = fullIpToSafeIp(headers['cf-connecting-ip'] ?? ip);
    logger.info(`收到webSocket请求${req.path}`, { ip: sIp, req: requestId });
    try {
        const token = query.token;
        if (!token) {
            logger.warn(`无效的token`, { ip: sIp });
            ws.close(4401, 'Missing token');
            return;
        }
        const payload = await AuthService.verifyAccessToken(token);
        req.payload = payload;
        req.token = token;
        logger.info(`${payload.id}建立WebSocket连接`, { req: req.requestId });
        next();
    } catch (error) {
        logger.error(`WebSocket 认证失败:, ${error.message}`);
        ws.close(4403, 'Invalid or expired token');
    }
};
module.exports = auth;