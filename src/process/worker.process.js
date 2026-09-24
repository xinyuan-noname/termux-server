const { spawn } = require('child_process');
const { WORKER_INDEX_FILE } = require('../config/paths');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
function startWorker() {
    const child = spawn(RUN_IN_DEV ? "nodemon" : "node", [WORKER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startWorker;