const logger = require("../logger");
const AuthService = require("../service/auth.service");
const { fullIpToSafeIp } = require("../utils/ip");

/**
 * 
 * @param {import("ws").WebSocket} ws 
 * @param {import("express").Request} req 
 * @param {Function} next 
 */
const auth = async (ws, req, next) => {
    const { headers, ip, query, originalUrl } = req;
    const sIp = fullIpToSafeIp(headers['cf-connecting-ip'] ?? ip);
    logger.info(`收到webSocket请求${originalUrl}`, { ip: sIp, })
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
        logger.info(`${payload.id}建立连接`, { req: req.requestId });
        next();
    } catch (error) {
        logger.error(`WebSocket 认证失败:, ${error.message}`);
        ws.close(4403, 'Invalid or expired token');
    }
};
module.exports = auth;