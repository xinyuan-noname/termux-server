const rateLimit = require("express-rate-limit");
module.exports = (windowMinutes = 15, max = 5, message = "Rate limit exceeded", options = {}) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        message: { error: String(message), code: "RATE_LIMIT_EXCEEDED" },
        standardHeaders: true,
        legacyHeaders: false,
        ...options
    })
}