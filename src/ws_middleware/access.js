const logger = require("../config/logger");
const AuthService = require("../service/auth.service");
const { getAccessTokenFromReq } = require("../utils/verification");

/**
 * 
 * @param {import("ws").WebSocket} ws 
 * @param {import("express").Request} req 
 * @param {Function} next 
 */
const access = async (ws, req, next) => {
    try {
        const token = getAccessTokenFromReq(req);
        if (!token) {
            ws.close(4401, 'Missing access token');
            return;
        }
        const payload = await AuthService.verifyAccessToken(token);
        req.accessPayload = payload;
        req.accessToken = token;
        logger.info(`${payload.id}建立连接`, { req: req.requestId });
        next();
    } catch (error) {
        logger.error(`WebSocket 认证失败:, ${error.message}`);
        ws.close(4403, 'Invalid or expired token');
    }
};
module.exports = access;