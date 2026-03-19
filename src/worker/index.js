const workerLogger = require('../logger/worker');
const redis = require("../redis");
async function start() {
    try {
        await redis.connect();
        require('./delAvatar.worker');
        require('./delTask.worker');
    } catch {
        workerLogger.error("worker启动失败");
    }
}
start();