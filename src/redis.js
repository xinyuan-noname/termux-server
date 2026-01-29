const { createClient } = require("redis");
const logger = require("./logger");

const redis = createClient();

redis.on("error", (err) => {
    logger.error("Redis error:", err);
});

module.exports = redis;