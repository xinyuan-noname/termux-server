const redis = require("../redis");
async function redisConnect() {
    await redis.connect();
}
module.exports = redisConnect;