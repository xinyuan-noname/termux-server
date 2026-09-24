const workerLogger = require("../logger/worker");
const fs = require('fs').promises;
const path = require('path');
async function deleteFile(dir, filename) {
    if (!filename || typeof filename !== 'string') {
        workerLogger.warn(`[Delete] 未正确传入文件名: ${filename}`);
        return;
    }

    if (path.basename(filename) !== filename) {
        workerLogger.warn(`[Delete] 跳过非法文件名: ${filename}`);
        return;
    }

    const fullPath = path.resolve(dir, filename);
    try {
        await fs.unlink(fullPath);
        workerLogger.info(`[Delete] 成功删除: ${filename}`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            workerLogger.warn(`[Delete] 文件不存在: ${filename}`);
        } else {
            workerLogger.error(`[Delete] 删除失败 ${filename}: ${err.message}`, err);
        }
    }
}
module.exports = {
    deleteFile
}