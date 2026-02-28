const winston = require('winston');
const path = require("path");
const { LOGS_DEV_DIR, LOGS_PROD_DIR } = require('../config/paths');
const { LOG_MAX_SIZE, LOG_MAX_FILES } = require('../config/logger');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const LOG_DIR = RUN_IN_DEV ? LOGS_DEV_DIR : LOGS_PROD_DIR;
const tRegx = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g;
const clRegx = /\r?\n$/;
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
            const { timestamp, message } = info;
            return message.replace(tRegx, timestamp).replace(clRegx, "");
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.resolve(LOG_DIR, "cloudflared.log"),
            maxsize: LOG_MAX_SIZE,
            maxFiles: LOG_MAX_FILES,
            level: "info"
        })
    ]
});

module.exports = cloudflaredLogger;