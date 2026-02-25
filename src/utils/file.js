const path = require("path");
const { LOGS_DEV_DIR, URL_TXT_FILE } = require("../config/paths");
const redis = require("../redis");
const logger = require("../logger");
const fs = require("fs").promises;
const XLSX = require("xlsx");
async function clearLogs() {
    try {
        const logFileNameList = await fs.readdir(LOGS_DEV_DIR);
        await Promise.all(logFileNameList.map(async (logFileName) => {
            const logFilePath = path.resolve(LOGS_DEV_DIR, logFileName);
            const logFileStat = await fs.stat(logFilePath);
            if (logFileStat.isFile()) {
                await fs.truncate(logFilePath, 0);
            }
        }))
        logger.info("删除开发日志文件成功");
    } catch (err) {
        logger.warn("删除开发日志文件失败", err.message);
    }
    try {
        if (process.env.NODE_ENV === "development") {
            await redis.flushAll();
        }
        logger.info("删除Redis开发缓存成功");
    } catch (err) {
        logger.warn("删除Redis开发缓存失败", err.message);
    }
}

async function writeUrl(url) {
    await fs.writeFile(URL_TXT_FILE, url, "utf8");
}

function readExcelBufferAsJson(data) {
    const workbook = XLSX.read(data, {
        type: "buffer"
    });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
}
module.exports = {
    clearLogs,
    writeUrl,
    readExcelBufferAsJson
};