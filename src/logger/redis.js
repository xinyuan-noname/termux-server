const winston = require('winston');
const path = require("path");
const { LOGS_DEV_DIR, LOGS_PROD_DIR } = require('../config/paths');
const { LOG_MAX_SIZE, LOG_MAX_FILES } = require('../config/logger');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const LOG_DIR = RUN_IN_DEV ? LOGS_DEV_DIR : LOGS_PROD_DIR;
const redisTimeRegex = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/g;
const clRegx = /\r?\n$/;
const redisLogger = winston.createLogger({
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
            const { timestamp, message } = info;
            return message.replace(redisTimeRegex, timestamp).replace(clRegx, "");
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "redis.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level: "info"
        })
    ]
});

module.exports = redisLogger;