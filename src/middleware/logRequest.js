const logger = require("../logger");
const { generateRandomSafeString } = require("../utils/verification");
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
    const { method, originalUrl, headers, ip } = req;
    const start = Date.now();
    const requestId = generateRandomSafeString(16);
    logger.info(`收到请求${requestId}`)
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        logger.info(`${method} ${originalUrl} ${statusCode} (${duration}ms)`, {
            ip: headers['cf-connecting-ip'] ?? ip,
            userAgent: headers["user-agent"],
            request: requestId
        });
    });
    next();
};