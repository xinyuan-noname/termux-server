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
            const sql = fs.readFileSync(sqlPath,"utf-8");
            db.exec(sql);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    execSqlFile,
    execSqlFiles
};