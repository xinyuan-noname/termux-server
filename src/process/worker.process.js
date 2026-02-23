const { spawn } = require('child_process');
const { WORKER_INDEX_FILE } = require('../config/paths');
function startWorker() {
    const child = spawn("node", [WORKER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startWorker;