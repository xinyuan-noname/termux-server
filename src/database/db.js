const fs = require("fs");
const path = require("path");
const DataBase = require("better-sqlite3");
const pathsConfig = require("../config/paths");
const logger = require("../logger");
const { execSqlFiles, execOpenForeignKeys } = require("./execSql");
// 确保数据目录存在
if (!fs.existsSync(pathsConfig.DATA_DIR)) {
    logger.info(`"Data"目录没有找到, 正在创建:${pathsConfig.DATA_DIR}`);
    fs.mkdirSync(pathsConfig.DATA_DIR, { recursive: true });
}
const dbPath = path.resolve(pathsConfig.DATA_DIR, process.env.DATA_NAME);
const db = new DataBase(dbPath);
execOpenForeignKeys(db);
execSqlFiles(db, "table");
execSqlFiles(db, "trigger");
execSqlFiles(db, "view");
module.exports = db;