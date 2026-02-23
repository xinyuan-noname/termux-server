const { spawn } = require('child_process');
const { SERVER_INDEX_FILE } = require('../config/paths');
// eslint-disable-next-line no-unused-vars
function startServer(logger) {
    const child = spawn("node", [SERVER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startServer;