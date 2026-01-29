const winston = require('winston');
const RUN_IN_DEV = process.env.NODE_ENV === 'development';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            if (stack) {
                return ` ${timestamp} [${level.toUpperCase()}]:  ${message}\n ${stack}`;
            }
            return ` ${timestamp} [${level.toUpperCase()}]:  ${message}`;
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