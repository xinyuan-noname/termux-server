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

    const adminRoutes = require('./routes/admin.routes');
    app.use('/admin', adminRoutes);
    const authRoutes = require('./routes/auth.routes');
    app.use('/auth', authRoutes);
    const profilesRoutes = require('./routes/profiles.routes');
    app.use('/profiles', profilesRoutes);

    // Error Handling Middleware
    const errorHandler = require('./middleware/error');
    app.use("/", errorHandler);
} catch (err) {
    logger.error('服务初始化失败', err);
}


module.exports = app;