const express = require('express');
const expressWs = require('express-ws');
const cookieParser = require("cookie-parser");
const logger = require('./logger');
const redis = require('./redis');
const cors = require("cors");
async function start() {
    const PORT = process.env.PORT || 3000;
    try {
        await redis.connect();
        const app = express();
        expressWs(app);
        app.disable('x-powered-by');
        app.use(cors({
            origin: [process.env.APP_WEB_URL],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }));

        // Global Middleware
        app.use(express.json());
        app.use(cookieParser());
        const logRequest = require('./middleware/logRequest');
        app.use(logRequest);

        // Rate Limit Middleware
        const createRateLimiter = require("./middleware/rateLimit");
        app.get('/', createRateLimiter(1, 5), (req, res) => {
            res.status(200).end();
        });
        app.get("/test", createRateLimiter(1, 5), (req, res) => {
            return res.status(200).end("Shine Yarn!");
        }); // 60s w=5

        app.get("/resource/main/:resource", (req, res) => {
            const { resource } = req.params;
            const url = `https://gh.llkk.cc/https://raw.githubusercontent.com/xinyuan-noname/resource/main/${resource}`;
            logger.info(`重定向至${resource}`);
            return res.redirect(url);
        }, createRateLimiter(1, 30));
        const assetRoutes = require('./routes/asset.routes');
        app.use('/asset', assetRoutes);

        app.use(createRateLimiter(1, 70)) // 60s w=70

        const addWebSocketRouters = require("./routes/ws.routes");
        addWebSocketRouters(app);
        const groupRoutes = require('./routes/group.routes');
        app.use('/group', groupRoutes);
        const adminRoutes = require('./routes/admin.routes');
        app.use('/admin', adminRoutes);
        const authRoutes = require('./routes/auth.routes');
        app.use('/auth', authRoutes);
        const profilesRoutes = require('./routes/profiles.routes');
        app.use('/profiles', profilesRoutes);
        const subjectsRoutes = require('./routes/subjects.routes');
        app.use('/subjects', subjectsRoutes);
        const semestersRoutes = require('./routes/semesters.routes');
        app.use('/semesters', semestersRoutes);
        const scheduleRoutes = require("./routes/schedule.routes");
        app.use("/schedule", scheduleRoutes);
        const taskConfigRoutes = require('./routes/task_config.routes');
        app.use('/task/config', taskConfigRoutes);
        const taskUploadRoutes = require('./routes/task_upload.routes');
        app.use('/task/upload', taskUploadRoutes);
        const messageRoutes = require('./routes/message.routes');
        app.use('/message', messageRoutes);

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