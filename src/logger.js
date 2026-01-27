const winston = require('winston');
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
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/app.log' })
    ]
});

module.exports = logger;