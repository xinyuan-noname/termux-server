const { spawn } = require('child_process');
const { WORKER_INDEX_FILE } = require('../config/paths');
// eslint-disable-next-line no-unused-vars
function startWorker(logger) {
    const child = spawn("node", [WORKER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startWorker;