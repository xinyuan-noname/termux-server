const app = require("./app");
const logger = require("./logger");
const redis = require("./redis");
const PORT = process.env.PORT || 3000;
async function start() {
  try {
    await redis.connect();
    app.listen(PORT, () => {
      logger.info(`服务运行在端口:${PORT}`);
    });
  } catch (error) {
    logger.error("服务器启动失败:", error);
    process.exit(1); 
  }
}
start();