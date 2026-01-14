const fs = require("fs");
const path = require("path");
const pathsConfig = require("../../config/paths");
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 * @param  {...string} paths 
 */
function execSqlFile(db, ...paths) {
    const filePath = path.resolve(pathsConfig.DB_DIR, ...paths);
    if (!fs.existsSync(filePath)) {
        throw new Error(
            `数据库初始化失败：SQL 文件未找到。\n` +
            `路径: ${filePath}`
        );
    }
    const sql = fs.readFileSync(filePath, "utf-8");
    db.exec(sql);
}

module.exports = {
    execSqlFile,
};