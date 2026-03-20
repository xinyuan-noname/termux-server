const redis = require('../redis');
const workerLogger = require("../logger/worker");
const { CONVERT_TO_PDF_KEY } = require('../config/queue');
const FileLocation = require('../enum/file_location');
const { convertToPdf, readFileAsBuffer, writeFileByBuffer } = require('../utils/file');
const QUEUE_NAME = "convert-to-pdf-worker";
async function consumeQueue() {
    workerLogger.info(`${QUEUE_NAME}队列已启动...`);
    while (true) {
        try {
            const result = await redis.brPop(CONVERT_TO_PDF_KEY, 5);
            if (result) {
                const { source, target, sourcePath, sourceReisdsKey, targetPath, targetRedisKey } = JSON.parse(result);
                let buffer;
                switch (source) {
                    case FileLocation.redis:
                        buffer = await redis.get(sourceReisdsKey);
                        break;
                    case FileLocation.local:
                        buffer = await readFileAsBuffer(sourcePath);
                        break;
                }
                const convertedData = convertToPdf(buffer);
                switch (target) {
                    case FileLocation.redis:
                        await redis.set(targetRedisKey, convertedData);
                        break;
                    case FileLocation.local:
                        await writeFileByBuffer(targetPath, convertedData);
                        break;
                }
            }
        } catch (err) {
            workerLogger.error('消费队列出错:', err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

consumeQueue().catch(workerLogger.error);