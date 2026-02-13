const logger = require("../logger");
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;
        logger.info(`${method} ${originalUrl} ${statusCode} (${duration}ms)`, {
            ip: req.headers['cf-connecting-ip'] ?? req.ip,
            userAgent:req.headers["user-agent"],
        });
    });
    next();
};