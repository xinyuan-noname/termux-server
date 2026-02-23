const winston = require('winston');
const path = require("path");
const { LOGS_DEV_DIR, LOGS_PROD_DIR } = require('../config/paths');
const { LOG_MAX_SIZE, LOG_MAX_FILES } = require('../config/logger');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const LOG_DIR = RUN_IN_DEV ? LOGS_DEV_DIR : LOGS_PROD_DIR;
const cloudflaredLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => {
                return new Date().toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                    hour12: false
                })
            }
        }),
        winston.format.printf((info) => {
            const { timestamp, level, message, ...meta } = info;
            let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                output += JSON.stringify(meta);
            }
            return output;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "cloudflared.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES
        }),
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "cloudflared.error.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level: 'error'
        })
    ]
});

module.exports = cloudflaredLogger;