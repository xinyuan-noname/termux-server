const queueConfig = require("../../config/queue");
const redis = require('../redis');

async function enqueueAvatarDelete(filename) {
    if (!filename) return;
    await redis.lPush(queueConfig.DEL_AVATAR_KEY, filename);
}

module.exports = { enqueueAvatarDelete };