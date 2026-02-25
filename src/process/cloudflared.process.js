const { spawn } = require('child_process');
const cloudflaredLogger = require('../logger/cloudflared');
const urlRegx = /(?<=\s)https:\/\/[a-zA-Z0-9.-]*\.trycloudflare\.com(?=\s)/
function startCloudflaredTunnel(config) {
    const child = spawn("cloudflared", [
        "tunnel",
        "--url", `http://localhost:${process.env.PORT}`,
        "--metrics", `127.0.0.1:${process.env.PORT_CLOUDFLARED_METRICS}`,
        "--protocol", "http2"
    ], {
        stdio: ['ignore', 'ignore', 'pipe']
    });

    child.stderr.on('data', (data) => {
        const msg = data.toString();
        const match = msg.match(urlRegx);
        if (match != null && match[0].length) {
            const url = match[0];
            config?.onUrl?.(url, child);
        }
        cloudflaredLogger.info(msg);
    });
    return child;
}
module.exports = startCloudflaredTunnel;