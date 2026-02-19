const fs = require("fs");
const path = require("path");
const { DATA_DIR } = require("../../config/paths");
const Database = require("better-sqlite3");
const { execOpenForeignKeys, execSqlFiles, execGetAllTableNames, execGenTableBackup, execDropTables, execGetCommonCols, execMigrateCommonCols } = require("./execSql");
require("dotenv").config();
const args = process.argv.slice(2);
const [oldDbFileName = ""] = args;
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
execDropTables(db, tables);
execOpenForeignKeys(db);
execSqlFiles(db, "table");
for (const tableName of tables) {
    const backupTableName = `${tableName}_backup`
    const commonCols = execGetCommonCols(db, tableName, backupTableName);
    if (commonCols.length) {
        execMigrateCommonCols(db, tableName, backupTableName, commonCols);
    }
}
execDropTables(db, tables, x => `${x}_backup`);