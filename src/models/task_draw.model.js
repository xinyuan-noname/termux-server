const db = require("../database/db");

class TaskDrawModel {

    /**
     * 根据 task_id 获取随机选人任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object|undefined} 随机选人任务配置
     */
    static getDrawByTaskId(task_id) {
        const stmt = db.prepare("SELECT * FROM task_draw WHERE task_id = ?");
        return stmt.get(task_id);
    }

    /**
     * 创建随机选人任务配置
     * @param {Object} drawData - 随机选人任务数据
     * @param {number} drawData.task_id - 任务 ID
     * @param {boolean} [drawData.reproducible] - 成员是否可重复抽取
     * @param {Array} [drawData.range_user_list] - 抽取范围用户列表
     * @returns {Object} 创建结果
     */
    static createDraw({ task_id, reproducible, range_user_list }) {
        const stmt = db.prepare(`
            INSERT INTO task_draw (task_id, reproducible, range_user_list)
            VALUES (?, ?, ?)
        `);
        return stmt.run(
            task_id,
            reproducible ? 1 : 0,
            range_user_list ? JSON.stringify(range_user_list) : null
        );
    }

    /**
     * 更新随机选人任务配置
     * @param {number} task_id - 任务 ID
     * @param {Object} drawData - 随机选人任务数据
     * @param {boolean} [drawData.reproducible] - 成员是否可重复抽取
     * @param {Array} [drawData.range_user_list] - 抽取范围用户列表
     * @returns {Object} 更新结果
     */
    static updateDraw(task_id, { reproducible, range_user_list }) {
        const fields = [];
        const values = [];

        if (reproducible !== undefined) {
            fields.push("reproducible = ?");
            values.push(reproducible ? 1 : 0);
        }
        if (range_user_list !== undefined) {
            fields.push("range_user_list = ?");
            values.push(range_user_list ? JSON.stringify(range_user_list) : null);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(task_id);
        const stmt = db.prepare(`UPDATE task_draw SET ${fields.join(", ")} WHERE task_id = ?`);
        return stmt.run(...values);
    }

    /**
     * 删除随机选人任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteDraw(task_id) {
        const stmt = db.prepare("DELETE FROM task_draw WHERE task_id = ?");
        return stmt.run(task_id);
    }
}

module.exports = TaskDrawModel;
