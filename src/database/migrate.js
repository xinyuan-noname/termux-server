const logger = require("../logger");

// 旧版本 task_config 中的错误约束写法: 比较表达式被当成 JSON 文档传给了 json_type
const BROKEN_DRAW_RESULT_CHECK = "json_type(json(draw_result) = 'array')";
// 修正后的写法
const FIXED_DRAW_RESULT_CHECK = "json_type(json(draw_result)) = 'array'";

/**
 * 把建表语句中的表名替换为重建用的临时表名
 * @param {string} createSql - sqlite_master 中记录的建表语句
 * @param {string} tableName - 原表名
 * @param {string} newTableName - 临时表名
 * @returns {string|null} 替换后的建表语句
 */
function renameCreateTable(createSql, tableName, newTableName) {
    const pattern = new RegExp(`^\\s*CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?["'\`]?${tableName}["'\`]?\\s*\\(`, "i");
    if (!pattern.test(createSql)) return null;
    return createSql.replace(pattern, `CREATE TABLE ${newTableName} (`);
}

/**
 * 修复旧数据库中 task_config 表的 draw_result 校验约束
 *
 * 旧写法 `json_type(json(draw_result) = 'array')` 会先算出比较结果再交给 json_type 解析,
 * 导致任何非空 draw_result 都触发 CHECK 失败, 抽取结果根本无法落库。
 * 这里按 SQLite 官方推荐的重建流程(建新表 -> 拷数据 -> 删旧表 -> 改名)修复已存在的数据库,
 * 新建数据库会直接使用 db/table/C1-task_config.sql 中已修正的约束。
 * @param {import("better-sqlite3").Database} db - 数据库实例
 * @returns {boolean} 是否执行了修复
 */
function migrateTaskConfigDrawResultCheck(db) {
    const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'task_config'").get();
    if (!row || typeof row.sql !== "string") return false;
    if (!row.sql.includes(BROKEN_DRAW_RESULT_CHECK)) return false;

    const fixedCreateSql = renameCreateTable(
        row.sql.replace(BROKEN_DRAW_RESULT_CHECK, FIXED_DRAW_RESULT_CHECK),
        "task_config",
        "task_config_new"
    );
    if (!fixedCreateSql) {
        logger.error("task_config 表结构修复失败: 无法解析建表语句");
        return false;
    }

    logger.warn("检测到 task_config.draw_result 的校验约束有误, 正在重建该表");
    // 重建过程中需要暂时关闭外键约束, 否则删除旧表会被引用它的子表阻止
    db.exec("PRAGMA foreign_keys = OFF;");
    try {
        db.exec("BEGIN");
        db.exec(fixedCreateSql);
        db.exec("INSERT INTO task_config_new SELECT * FROM task_config");
        db.exec("DROP TABLE task_config");
        db.exec("ALTER TABLE task_config_new RENAME TO task_config");
        db.exec("COMMIT");
        logger.info("task_config 表重建完成");
        return true;
    } catch (error) {
        db.exec("ROLLBACK");
        logger.error("task_config 表重建失败", error);
        throw error;
    } finally {
        db.exec("PRAGMA foreign_keys = ON;");
    }
}

/**
 * 执行所有数据库结构修复
 * @param {import("better-sqlite3").Database} db - 数据库实例
 */
function migrateDatabase(db) {
    migrateTaskConfigDrawResultCheck(db);
}

module.exports = migrateDatabase;
module.exports.migrateTaskConfigDrawResultCheck = migrateTaskConfigDrawResultCheck;
