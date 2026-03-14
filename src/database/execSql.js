const fs = require("fs");
const path = require("path");
const pathsConfig = require("../config/paths");
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
        console.log(`正在执行${file}`)
        try {
            if (!file.endsWith(".sql")) continue;
            const sqlPath = path.resolve(folderPath, file);
            const sql = fs.readFileSync(sqlPath, "utf-8");
            db.exec(sql);
        } catch (error) {
            console.error(`执行${file}失败`, error);
        }
        console.log(`执行${file}结束`)
    }
}
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 */
function execOpenForeignKeys(db) {
    db.exec('PRAGMA foreign_keys = ON;');
}
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 */
function execGetAllTableNames(db) {
    return db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all().map(o => o.name);
}
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 * @param {string[]} tables 
 */
function execGenTableBackup(db, tables) {
    for (const tableName of tables) {
        const backupName = `${tableName}_backup`;
        db.exec(`DROP TABLE IF EXISTS ${backupName}`);
        db.exec(`CREATE TABLE ${backupName} AS SELECT * FROM ${tableName}`);
    }
}
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 * @param {string[]} tables 
 * @param {(x:string)=>string} alias
 */
function execDropTables(db, tables, alias = x => x) {
    for (const tableName of tables) {
        try{
            const aliasName = alias(tableName);
            db.exec(`DROP TABLE IF EXISTS ${aliasName}`);
        }catch(error){
            console.log(`${tableName}废除失败`)
            console.error(error);
        }
    }
}
/**
 * 
 * @param {import("better-sqlite3").Database} db 
 * 
 *
 */
function execGetCommonCols(db, newTableName, oldTableName) {
    const oldCols = db.prepare(`PRAGMA table_info(${oldTableName})`).all();
    const newCols = db.prepare(`PRAGMA table_info(${newTableName})`).all();
    const commonCols = oldCols
        .filter(old => newCols.find(newCol => newCol.name === old.name))
        .map(c => c.name);
    return commonCols;
}
function execMigrateCommonCols(db, newTableName,  oldTableName,commonCols) {
    const joinedCols = commonCols.join(",")
    db.exec(`
      INSERT INTO ${newTableName} (${joinedCols}) 
      SELECT ${joinedCols} FROM ${oldTableName}
    `);
}
module.exports = {
    execSqlFiles,
    execOpenForeignKeys,
    execGetAllTableNames,
    execGenTableBackup,
    execDropTables,
    execGetCommonCols,
    execMigrateCommonCols
};