const path = require("path");
const { LOGS_DEV_DIR } = require("../config/paths");
const fs = require("fs").promises;
async function clear() {
    try {
        const logFileNameList = await fs.readdir(LOGS_DEV_DIR);
        await Promise.all(logFileNameList.map(async (logFileName) => {
            const logFilePath = path.resolve(LOGS_DEV_DIR, logFileName);
            const logFileStat = await fs.stat(logFilePath);
            if (logFileStat.isFile()) {
                await fs.truncate(logFilePath, 0);
            }
        }))
        console.log("删除开发日志文件成功");
    } catch (err) {
        console.error("删除开发日志文件失败", err.message);
    }
}
module.exports = clear;