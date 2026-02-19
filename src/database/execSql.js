const fs = require("fs");
const path = require("path");
const pathsConfig = require("../../config/paths");
const logger = require("../logger");
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 * @param  {...string} paths 
 */
function execSqlFiles(db, ...paths) {
    const folderPath = path.resolve(pathsConfig.DB_DIR, ...paths);
    if (!fs.existsSync(folderPath)) {
        throw new Error(
            `数据库初始化失败：SQL 文件夹未找到。\n` +
            `路径: ${folderPath}`
        );
    }
    const files = fs.readdirSync(folderPath, "utf-8");
    for (const file of files) {
        try {
            if (!file.endsWith(".sql")) continue;
            const sqlPath = path.resolve(folderPath, file);
            const sql = fs.readFileSync(sqlPath, "utf-8");
            db.exec(sql);
        } catch (error) {
            logger.error(`执行${file}失败`, error);
        }
    }
}
function execOpenForeignKeys(db) {
    db.exec('PRAGMA foreign_keys = ON;');
}
module.exports = {
    execSqlFiles,
    execOpenForeignKeys
};