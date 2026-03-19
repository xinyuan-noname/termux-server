const redis = require('../redis');
const queueConfig = require("../config/queue");
const workerLogger = require("../logger/worker");
const { deleteFile } = require('../utils/worker');
const { TASK_UPLOAD_DIR } = require('../config/paths');

/**
 * 消费删除任务的队列
 * 从 Redis 队列中获取任务 ID 和上传文件名，删除对应的上传文件
 */
async function consumeDelTaskQueue() {
    workerLogger.info('del-task-worker已启动...');
    while (true) {
        try {
            // 从 Redis 队列中阻塞获取任务信息
            const result = await redis.brPop(queueConfig.DEL_TASK_KEY, 5);
            if (result) {
                const taskData = JSON.parse(result.element);
                const { taskId, uploadFileName } = taskData;
                
                // 删除上传的文件
                if (uploadFileName && taskId) {
                    await deleteFile(TASK_UPLOAD_DIR, `${taskId}_${uploadFileName}`);
                    workerLogger.info(`已删除任务文件：${taskId}_${uploadFileName}`);
                }
            }
        } catch (err) {
            workerLogger.error('消费删除任务队列出错:', err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

consumeDelTaskQueue().catch(workerLogger.error);
