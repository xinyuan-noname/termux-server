const redis = require("./redis");
const logger = require("./logger");
const PORT = process.env.PORT || 3000;
async function start() {
  try {
    await redis.connect();
    if (process.env.NODE_ENV === "development") {
      await redis.flushAll();
    }
    const app = require("./app");
    app.listen(PORT, () => {
      logger.info(`服务运行在端口:${PORT}`);
    });
  } catch (error) {
    logger.error("服务器启动失败:", error);
    process.exit(1);
  }
}
start();