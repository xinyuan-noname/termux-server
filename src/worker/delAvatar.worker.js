
const redis = require('../redis');
const queueConfig = require("../config/queue");
const workerLogger = require("../logger/worker");
const { deleteFile } = require('../utils/worker');
const { AVATAR_DIR } = require('../config/paths');
async function consumeQueue() {
    workerLogger.info('avatar-worker已启动...');
    while (true) {
        try {
            const result = await redis.brPop(queueConfig.DEL_AVATAR_KEY, 5);
            if (result) {
                const filename = result.element;
                await deleteFile(AVATAR_DIR, filename);
            }
        } catch (err) {
            workerLogger.error('消费队列出错:', err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

consumeQueue().catch(workerLogger.error);