const { spawn } = require('child_process');
const cloudflaredLogger = require('../logger/cloudflared');
function startCloudflaredTunnel() {
    const child = spawn("cloudflared", [
        "tunnel",
        "--url", `http://localhost:${process.env.PORT}`,
        "--metrics", `127.0.0.1:${process.env.PORT_CLOUDFLARED_METRICS}`,
        "--protocol", "http2"
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.on('data', (data) => {
        cloudflaredLogger.info(data.toString());
    });

    child.stderr.on('data', (data) => {
        cloudflaredLogger.warn(data.toString());
    });
    return child;
}
module.exports = startCloudflaredTunnel;