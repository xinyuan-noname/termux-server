const workerLogger = require('../logger/worker');
const redis = require("../redis");
async function start() {
    try {
        await redis.connect();
        require('./del_avatar.worker');
        require('./del_task.worker');
        require('./convert_to_pdf.worker');
    } catch {
        workerLogger.error("worker启动失败");
    }
}
start();