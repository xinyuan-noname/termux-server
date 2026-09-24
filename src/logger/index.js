const winston = require('winston');
const path = require("path");
const { LOG_MAX_SIZE, LOG_MAX_FILES } = require('../config/logger');
const { LOGS_DEV_DIR, LOGS_PROD_DIR } = require('../config/paths');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const LOG_DIR = RUN_IN_DEV ? LOGS_DEV_DIR : LOGS_PROD_DIR;
const logger = winston.createLogger({
    level: 'debug',
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
            const { timestamp, level, message, stack, ...meta } = info;
            let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (Object.keys(meta).length > 0) {
                output += JSON.stringify(meta);
            }
            if (stack) {
                output += `\n${stack}`;
            }
            return output;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "app.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level: "info"
        }),
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "app.error.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level: 'error'
        })
    ]
});
logger.add(new winston.transports.Console());
module.exports = logger;