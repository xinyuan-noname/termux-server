
const redis = require('../redis'); // 你的 Redis 客户端
const fs = require('fs').promises;
const path = require('path');
const dirConfig = require("../../config/paths");
const workerLogger = require("./logger.worker");
const AVATAR_DIR = dirConfig.AVATAR_DIR;
async function deleteFile(filename) {
    if (!filename) return;

    // 安全检查：防止路径穿越
    if (filename.includes('..') || filename.includes('/')) {
        workerLogger.warn(`[Delete] 跳过非法文件名: ${filename}`);
        return;
    }

    const fullPath = path.join(AVATAR_DIR, filename);
    try {
        await fs.access(fullPath); // 检查文件是否存在
        await fs.unlink(fullPath);
        workerLogger.log(`[Delete] 成功删除: ${filename}`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            workerLogger.warn(`[Delete] 文件不存在: ${filename}`, err);
        } else {
            workerLogger.error(`[Delete] 删除失败 ${filename}:${err.message}`, err);
        }
    }
}

async function consumeQueue() {
    workerLogger.log('[Worker] 文件删除消费者已启动...');

    while (true) {
        try {
            const result = await redis.brPop('delete_queue', 5);

            if (result) {
                const filename = result[1];
                await deleteFile(filename);
            }
        } catch (err) {
            workerLogger.error('[Worker] 消费队列出错:', err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

consumeQueue().catch(workerLogger.error);