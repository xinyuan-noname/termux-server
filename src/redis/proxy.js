const { RESP_TYPES } = require("redis");
const redis = require(".");

const proxyRedis = redis.withTypeMapping({
    [RESP_TYPES.BLOB_STRING]: Buffer
});

module.exports = proxyRedis;