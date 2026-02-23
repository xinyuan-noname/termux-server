const clear = require('./clear.dev');
const startCloudflaredTunnel = require('./cloudflared.process');
const startRedis = require('./redis.process');
const startServer = require('./server.process');
const startWorker = require('./worker.process');
require('dotenv').config();
const logger = require('../logger');
const workerLogger = require('../logger/worker');
const redisLogger = require('../logger/redis');
const cloudflaredLogger = require('../logger/cloudflared');

const processes = new Map([
    ['redis', {
        start: () => startRedis(redisLogger),
        maxRestarts: 5,
        restartTimes: []
    }],
    ['server', {
        start: () => startServer(logger),
        maxRestarts: 3,
        restartTimes: []
    }],
    ['worker', {
        start: () => startWorker(workerLogger),
        maxRestarts: 5,
        restartTimes: []
    }],
    ['cloudflared', {
        start: () => startCloudflaredTunnel(cloudflaredLogger),
        maxRestarts: 10,
        restartTimes: []
    }],
]);

const RESTART_WINDOW = 60000;
const RESTART_DELAY = 2000;

function shouldRestart(proc) {
    const now = Date.now();
    proc.restartTimes = proc.restartTimes.filter(t => now - t < RESTART_WINDOW);
    return proc.restartTimes.length < proc.maxRestarts;
}

function startProcess(name) {
    const proc = processes.get(name);
    if (!proc || proc.stopped) return;

    logger.info(`[${name}] 启动`);
    proc.child = proc.start();
    const handleExit = (name, code) => {
        proc.restartTimes.push(Date.now());

        if (shouldRestart(proc)) {
            logger.warn(`[${name}] 退出 | 代码：${code} | 重启 (${proc.restartTimes.length}/${proc.maxRestarts})`);
            setTimeout(() => startProcess(name), RESTART_DELAY);
        } else {
            logger.error(`[${name}] 1 分钟内重启 ${proc.maxRestarts} 次，退出`);
            shutdown('TOO_MANY_RESTARTS');
        }
    }
    let hasError = false;

    proc.child.on('error', (err) => {
        hasError = true;
        logger.error(`[${name}] 启动失败：${err.message}`);
        handleExit(name, err.code);
    });

    proc.child.on('close', (code) => {
        if (proc.stopped) return;

        if (hasError) {
            logger.debug(`[${name}] close 事件（error 已处理）`);
            return;
        }

        handleExit(name, code);
    });
}

async function start() {
    if (process.env.NODE_ENV === 'development') {
        await clear();
    }

    logger.info('🚀 启动服务...');

    startProcess('redis');

    startWorker("worker");
    startProcess("server");

    startCloudflaredTunnel("cloudflared");

    logger.info('✅ 所有服务启动完成');
}

async function shutdown(reason) {
    logger.info(`正在关闭 (${reason})...`);

    processes.forEach((proc) => {
        proc.stopped = true;
        proc.child?.kill('SIGTERM');
    });

    await new Promise(r => setTimeout(r, 1000));
    process.exit(reason ? 1 : 0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch(err => {
    logger.error(`启动失败：${err.message}`);
    process.exit(1);
});