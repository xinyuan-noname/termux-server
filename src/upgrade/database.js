const fs = require("fs");
const path = require("path");
const { DATA_DIR } = require("../config/paths");
const Database = require("better-sqlite3");
const {
    execOpenForeignKeys,
    execSqlFiles,
    execGetAllTableNames,
    execGenTableBackup,
    execDropTables,
    execGetCommonCols,
    execMigrateCommonCols
} = require("../database/execSql");
function updateDatabase(oldDbFileName) {
    const oldDbPath = path.resolve(DATA_DIR, oldDbFileName);
    const newDbPath = path.resolve(DATA_DIR, process.env.DATA_NAME);
    if (!fs.existsSync(oldDbPath)) {
        console.error("旧数据库没有找到");
        process.exit(1);
    }
    const data = fs.readFileSync(oldDbPath);
    fs.writeFileSync(newDbPath, data);
    const db = new Database(newDbPath);
    const tables = execGetAllTableNames(db);
    execGenTableBackup(db, tables);
    //应该先删除子表，后删除父表
    execDropTables(db, execGetAllTableNames(db).reverse());
    execOpenForeignKeys(db);
    execSqlFiles(db, "table");
    for (const tableName of execGetAllTableNames(db)) {
        const backupTableName = `${tableName}_backup`;
        const commonCols = execGetCommonCols(db, tableName, backupTableName);
        if (commonCols.length) {
            execMigrateCommonCols(db, tableName, backupTableName, commonCols);
        }
    }
    // 这里由于只复制了数据，不分先后
    execDropTables(db, tables, x => `${x}_backup`);
}
module.exports = updateDatabase;