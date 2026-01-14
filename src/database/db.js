const fs = require("fs");
const path = require("path");
const DataBase = require("better-sqlite3");
const pathsConfig = require("../../config/paths");
const { execSqlFile } = require("../utils/database");
// 确保数据目录存在
if (!fs.existsSync(pathsConfig.DATA_DIR)) {
    console.log(`[INFO] Data directory not found, creating: ${pathsConfig.DATA_DIR}`);
    fs.mkdirSync(pathsConfig.DATA_DIR, { recursive: true });
}
const dbPath = path.resolve(pathsConfig.DATA_DIR, "app.db");
const db = new DataBase(dbPath);
execSqlFile(db, "auth.sql");
execSqlFile(db, "profiles.sql");
execSqlFile(db, "refresh_token.sql");
module.exports = db;