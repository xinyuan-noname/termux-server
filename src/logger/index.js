const winston = require('winston');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const logger = winston.createLogger({
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
            const { timestamp, level, message, stack, ...meta } = info;
            let output = ` ${timestamp} [${level.toUpperCase()}]: ${message}`;
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
        RUN_IN_DEV ?
            new winston.transports.File({ filename: 'logs/dev/app.log' }) :
            new winston.transports.File({ filename: 'logs/prod/app.log' }),
        RUN_IN_DEV ?
            new winston.transports.File({ filename: 'logs/dev/error.log', level: 'error' }) :
            new winston.transports.File({ filename: 'logs/prod/error.log', level: 'error' })
    ]
});
if (RUN_IN_DEV) {
    logger.add(new winston.transports.Console());
}
module.exports = logger;