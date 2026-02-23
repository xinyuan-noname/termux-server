const workerLogger = require('../logger/worker');
const redis = require("../redis");
async function start() {
    try {
        await redis.connect();
        require('./delAvatar.worker');
    } catch {
        workerLogger.error("worker启动失败");
        process.exit(1);
    }
}
start();