const express = require('express');
const cookieParser = require("cookie-parser");
const logger = require('./logger');
const redis = require('./redis');
async function start() {
    const PORT = process.env.PORT || 3000;
    try {
        await redis.connect();
        const app = express();
        app.disable('x-powered-by');
        // Global Middleware
        app.use(express.json());
        app.use(cookieParser());
        const logRequest = require('./middleware/logRequest');
        app.use(logRequest);

        // Rate Limit Middleware
        const createRateLimiter = require("./middleware/rateLimit");
        app.get("/test", createRateLimiter(1, 150), (req, res) => {
            return res.status(200).end("Shine Yarn!");
        }); // 60s w=150
        app.use(createRateLimiter(1, 70)) // 60s w=70

        const adminRoutes = require('./routes/admin.routes');
        app.use('/admin', adminRoutes);
        const authRoutes = require('./routes/auth.routes');
        app.use('/auth', authRoutes);
        const profilesRoutes = require('./routes/profiles.routes');
        app.use('/profiles', profilesRoutes);

        // Error Handling Middleware
        const errorHandler = require('./middleware/error');
        app.use("/", errorHandler);


        app.listen(PORT, () => {
            logger.info(`服务运行在端口:${PORT}`);
        });
    } catch (error) {
        logger.error("服务器启动失败:", error);
    }
}
start();