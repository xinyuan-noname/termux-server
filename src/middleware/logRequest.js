const logger = require("../logger");
const { fullIpToSafeIp } = require("../utils/ip");
const { generateRandomSafeString } = require("../utils/verification");

function getRequestLevel(req) {
    const { originalUrl, headers } = req;
    if (originalUrl === "/test" && headers["user-agent"].startsWith("curl")) return "debug";
    return "info"
}
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
    const rl = getRequestLevel(req);
    logger[rl](`收到请求${requestId}`);
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        logger[rl](`${method} ${originalUrl} ${statusCode} (${duration}ms)`, {
            ip: fullIpToSafeIp(headers['cf-connecting-ip'] ?? ip),
            userAgent: headers["user-agent"],
            request: requestId
        });
    });
    next();
};