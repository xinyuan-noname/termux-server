const { spawn } = require('child_process');
const { SERVER_INDEX_FILE } = require('../config/paths');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
function startServer() {
    const child = spawn(
        RUN_IN_DEV ? "nodemon" : "node", [SERVER_INDEX_FILE], {
        stdio: 'inherit'
    });
    return child;
}
module.exports = startServer;