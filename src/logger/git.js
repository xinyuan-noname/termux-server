const winston = require('winston');
const path = require("path");
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const { LOG_MAX_SIZE, LOG_MAX_FILES } = require('../config/logger');
const { LOGS_DEV_DIR, LOGS_PROD_DIR } = require('../config/paths');
const LOG_DIR = RUN_IN_DEV ? LOGS_DEV_DIR : LOGS_PROD_DIR;
const gitLogger = winston.createLogger({
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
        winston.format.errors({ stack: true }),
        winston.format.printf((info) => {
            const { timestamp, level, message, } = info;
            let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            return output;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "git.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level:"info"
        }),
    ]
});
module.exports = gitLogger;