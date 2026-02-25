require('dotenv').config();
const startCloudflaredTunnel = require('./cloudflared.process');
const startRedis = require('./redis.process');
const startServer = require('./server.process');
const startWorker = require('./worker.process');
const logger = require('../logger');
const { clearLogs, writeUrl } = require('../utils/file');
const startGit = require('./git.process');
const { RESTART_WINDOW, RESTART_DELAY, GIT_TRY_MAX_TIMES } = require('../config/process');
const { startChecker } = require('./checker.process');
const processes = new Map([
    ['redis', {
        start: startRedis,
        maxRestarts: 5,
        restartTimes: []
    }],
    ['server', {
        start: startServer,
        maxRestarts: 3,
        restartTimes: []
    }],
    ['worker', {
        start: startWorker,
        maxRestarts: 5,
        restartTimes: []
    }],
    ['cloudflared', {
        start: startCloudflaredTunnel,
        maxRestarts: 5,
        restartTimes: []
    }],
]);



function shouldRestart(proc) {
    const now = Date.now();
    proc.restartTimes = proc.restartTimes.filter(t => now - t < RESTART_WINDOW);
    return proc.restartTimes.length < proc.maxRestarts;
}

function startProcess(name, config) {
    const proc = processes.get(name);
    if (!proc || proc.stopped) return;

    logger.info(`[${name}] 启动`);
    proc.child = proc.start(config);
    const handleExit = (name, code, signal) => {
        proc.restartTimes.push(Date.now());

        if (shouldRestart(proc)) {
            logger.warn(`[${name}] 退出 | 代码：${code} | 信号：${signal} | 重启 (${proc.restartTimes.length}/${proc.maxRestarts})`);
            setTimeout(() => startProcess(name, config), RESTART_DELAY);
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

    proc.child.on('close', (code, signal) => {
        if (proc.stopped) return;
        if (hasError) return;
        if (name === "cloudflared" && proc.child.url && !proc.child.loseConnection) return;
        handleExit(name, code, signal);
    });
}

async function start() {
    if (process.env.NODE_ENV === 'development') {
        await clearLogs();
    }

    logger.info('🚀 启动服务...');

    startProcess('redis');
    startProcess("worker");
    startProcess("server");
    startProcess("cloudflared", {
        async onUrl(url, child) {
            logger.info(`暴露公网地址: ${url}`);
            await writeUrl(url);
            let success = false;
            for (let i = 0; i < GIT_TRY_MAX_TIMES; i++) {
                success = await startGit();
                if (success) {
                    logger.info(`git成功推送地址`);
                    break;
                }
            }
            if (!success) {
                logger.info('git推送地址失败');
                shutdown("GIT_ERROR");
            }
            const timer = setInterval(async () => {
                if (child.killed) clearInterval(timer);
                const success = await startChecker(`${url}/test`);
                if (!success) {
                    child.loseConnection = true;
                    clearInterval(timer);
                    child.kill("SIGTERM");
                }
            }, 750);
        }
    });
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