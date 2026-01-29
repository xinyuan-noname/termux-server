const express = require('express');
const cookieParser = require("cookie-parser");
const logger = require('./logger');
require('dotenv').config();

const app = express();
try {
    // Global Middleware
    app.use(express.json());
    app.use(cookieParser());

    // Rate Limit Middleware
    const createRateLimiter = require("./middleware/rateLimit");
    app.use(createRateLimiter(1, 150, void 0)) // 60s w=150

    // Parser Device Middleware
    const parseDeviceMiddleware = require("./middleware/parserDevice");

    // Routes
    const authRoutes = require('./routes/auth.routes');
    app.use('/auth', parseDeviceMiddleware, authRoutes);

    // Error Handling Middleware
    const errorHandler = require('./middleware/error');
    app.use(errorHandler);
} catch (err) {
    logger.error('环境变量加载失败', err);
}


module.exports = app;