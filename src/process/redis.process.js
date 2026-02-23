const { spawn } = require('child_process');
function startRedis(logger) {
    const child = spawn("redis-server", [
        '--port', process.env.PORT_REDIS,
        "--daemonize", "yes",
        "--loglevel", "notice",
        '--appendonly', 'yes',
        '--maxmemory', '256mb',
        '--maxmemory-policy', 'allkeys-lru'
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.on('data', (data) => {
        logger.info(data.toString());
    });

    child.stderr.on('data', (data) => {
        logger.warn(data.toString());
    });
    return child;
}
module.exports = startRedis;