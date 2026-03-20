const queueConfig = require("../config/queue");
const FileLocation = require("../enum/file_location");
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
/**
 * 将PDF转换任务加入队列
 * @param {Object} convertOptions - 转换选项配置对象
 * @param {string} convertOptions.source - 源文件位置（FileLocation枚举值）
 * @param {string} convertOptions.target - 目标文件位置（FileLocation枚举值）
 * @param {string} [convertOptions.sourcePath] - 源文件本地路径（当source为local时必需）
 * @param {string} [convertOptions.sourceReisdsKey] - 源文件Redis键（当source为redis时必需）
 * @param {string} [convertOptions.targetPath] - 目标文件本地路径（当target为local时必需）
 * @param {string} [convertOptions.targetRedisKey] - 目标文件Redis键（当target为redis时必需）
 * @returns {Promise<void>} 无返回值的Promise
 */
async function enqueueConvertToPdf(convertOptions = {}) {
    const { source, target, sourcePath, sourceReisdsKey, targetPath, targetRedisKey } = convertOptions;
    if (!(source in FileLocation)) {
        logger.warn(`收到未知的转换来源${source}`)
        return;
    }
    if (!(target in FileLocation)) {
        logger.warn(`收到未知的文件去向${target}`);
        return;
    }
    switch (source) {
        case FileLocation.redis:
            if (!sourceReisdsKey) {
                logger.warn(`收到无效的redis-key作为文件来源`);
                return;
            }
            break;
        case FileLocation.local:
            if (!sourcePath) {
                logger.warn(`收到无效的路径作为文件来源`);
                return;
            }
            break;
    }
    switch (target) {
        case FileLocation.redis:
            if (!targetRedisKey) {
                logger.warn(`收到无效的redis-key作为文件去向`);
                return;
            }
            break;
        case FileLocation.local:
            if (!targetPath) {
                logger.warn(`收到无效的路径作为文件去向`);
                return;
            }
            break;
    }
    await redis.lPush(queueConfig.CONVERT_TO_PDF_KEY, JSON.stringify(convertOptions));
    logger.info(`有文件加入文件转换队列`);
}

module.exports = {
    enqueueAvatarDelete,
    enqueueTaskDelete,
    enqueueConvertToPdf
};
