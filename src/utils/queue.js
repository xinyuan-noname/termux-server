const queueConfig = require("../config/queue");
const logger = require("../logger");
const redis = require('../redis');

/**
 * 将头像文件名加入删除队列
 * @param {string} filename - 要删除的头像文件名
 */
async function enqueueAvatarDelete(filename) {
    if (!filename) return;
    await redis.lPush(queueConfig.DEL_AVATAR_KEY, filename);
    logger.info(`${filename}加入 avatar 删除队列`);
}

/**
 * 将任务上传文件信息加入删除队列
 * @param {Object} params - 删除参数
 * @param {number} params.taskId - 任务 ID
 * @param {string} params.uploadFilePath - 上传文件名
 */
async function enqueueTaskDelete({ taskId, uploadFilePath } = {}) {
    if (!taskId || !uploadFilePath) {
        logger.warn('任务删除队列参数不完整', { taskId, uploadFilePath });
        return;
    }

    const taskData = {
        taskId,
        uploadFilePath
    };

    await redis.lPush(queueConfig.DEL_TASK_KEY, JSON.stringify(taskData));
    logger.info(`任务${taskId}的文件${uploadFilePath}加入删除队列`);
}

module.exports = {
    enqueueAvatarDelete,
    enqueueTaskDelete
};
