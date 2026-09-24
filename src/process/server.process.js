const { spawn } = require('child_process');
const { SERVER_INDEX_FILE } = require('../config/paths');
function startServer() {
    const child = spawn(
        "nodemon", [SERVER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startServer;