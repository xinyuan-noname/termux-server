const queueConfig = require("../../config/queue");
const logger = require("../logger");
const redis = require('../redis');

async function enqueueAvatarDelete(filename) {
    if (!filename) return;
    await redis.lPush(queueConfig.DEL_AVATAR_KEY, filename);
    logger.info(`${filename}加入avatar删除队列`);
}

module.exports = { enqueueAvatarDelete };