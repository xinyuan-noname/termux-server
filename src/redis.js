const { createClient } = require("redis");
const logger = require("./logger");

const redis = createClient();

redis.on("error", (err) => {
    logger.error("Redis error:", err);
});

redis.on("connect", () => {
    logger.info("✅ Redis connected");
});

redis.on("ready", () => {
    logger.info("✅ Redis ready to use");
});

redis.on("end", () => {
    logger.warn("⚠️ Redis connection closed");
});


module.exports = redis;