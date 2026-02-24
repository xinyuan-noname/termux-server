const { spawn } = require('child_process');
const redisLogger = require('../logger/redis');
function startRedis() {
    const child = spawn("redis-server", [
        '--port', process.env.PORT_REDIS,
        "--loglevel", "notice",
        '--appendonly', 'yes',
        '--maxmemory', '256mb',
        '--maxmemory-policy', 'allkeys-lru'
    ], {
        stdio: ['ignore', 'ignore', 'pipe']
    });
    child.stderr.on('data', (data) => {
        redisLogger.warn(data.toString());
    });
    return child;
}
module.exports = startRedis;