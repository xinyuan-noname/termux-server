const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { getAccessTokenFromReq } = require("../utils/verification");
const redis = require("../redis");

module.exports = (windowMinutes = 15, max = 5, useToken = false, errorMessage = "Rate limit exceeded", options = {}) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        message: { error: errorMessage, code: "RATE_LIMIT_EXCEEDED" },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: useToken ? (req) => {
            const token = getAccessTokenFromReq(req)
            const ip = req.headers['cf-connecting-ip'] || req.ip;
            return token ? `${token}:${ip}` : ip;
        } : (req) => {
            return req.headers['cf-connecting-ip'] || req.ip;
        },
        store: new RedisStore({
            client: redis,
            prefix: "rate-limit:",
        }),
        ...options
    })
}