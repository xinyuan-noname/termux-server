const redis = require('../redis');
const queueConfig = require("../config/queue");
const workerLogger = require("../logger/worker");
const { deleteFile } = require('../utils/worker');
const { TASK_DIR } = require('../config/paths');
const QUEUE_NAME = "del-task-worker";
async function consumeDelTaskQueue() {
    workerLogger.info(`${QUEUE_NAME}队列已启动...`);
    while (true) {
        try {
            const result = await redis.brPop(queueConfig.DEL_TASK_KEY, 5);
            if (result) {
                const taskData = JSON.parse(result.element);
                const { taskId, uploadFilePath } = taskData;
                if (uploadFilePath && taskId) {
                    await deleteFile(TASK_DIR, uploadFilePath);
                    workerLogger.info(`已删除任务文件：${uploadFilePath}(任务编号：1)`);
                }
            }
        } catch (err) {
            workerLogger.error(`${QUEUE_NAME}任务队列出错`, err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

consumeDelTaskQueue().catch(workerLogger.error);