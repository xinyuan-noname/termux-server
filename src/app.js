const express = require('express');
const cookieParser = require("cookie-parser");
const logger = require('./logger');
require('dotenv').config();

const app = express();
try {
    app.disable('x-powered-by');
    // Global Middleware
    app.use(express.json());
    app.use(cookieParser());

    //
    const logRequest = require('./middleware/logRequest');
    app.use(logRequest);
    // Rate Limit Middleware
    const createRateLimiter = require("./middleware/rateLimit");
    app.use(createRateLimiter(1, 70, void 0)) // 60s w=70

    // Parser Device Middleware
    const parseDeviceMiddleware = require("./middleware/parserDevice");

    // Routes
    app.get('/device', parseDeviceMiddleware, (req, res) => res.status(200).json(req.deviceDescription)); //本行用于测试设备是否能够正常识别
    const authRoutes = require('./routes/auth.routes');
    app.use('/auth', parseDeviceMiddleware, authRoutes);

    // Error Handling Middleware
    const errorHandler = require('./middleware/error');
    app.use("/", errorHandler);
} catch (err) {
    logger.error('服务初始化失败', err);
}


module.exports = app;