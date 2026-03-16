const db = require("../database/db");

class TaskConfigModel {

    /**
     * 根据 task_id 获取任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object|undefined} 任务配置对象
     */
    static getTaskById(task_id) {
        const stmt = db.prepare("SELECT * FROM task_config WHERE task_id = ?");
        return stmt.get(task_id);
    }

    /**
     * 获取所有任务配置
     * @returns {Array} 任务配置列表
     */
    static getAllTasks() {
        const stmt = db.prepare("SELECT * FROM task_config");
        return stmt.all();
    }

    /**
     * 根据 subject_name 获取任务配置列表
     * @param {string} subject_name - 科目名称
     * @returns {Array} 任务配置列表
     */
    static getTasksBySubject(subject_name) {
        const stmt = db.prepare("SELECT * FROM task_config WHERE subject_name = ?");
        return stmt.all(subject_name);
    }

    /**
     * 创建新的任务配置
     * @param {Object} taskData - 任务配置数据
     * @param {string} taskData.title - 任务标题
     * @param {number} taskData.started_at - 开始时间戳
     * @param {number} taskData.ended_at - 结束时间戳
     * @param {string} [taskData.subject_name] - 科目名称（可选）
     * @param {string} [taskData.mimetype] - MIME 类型（可选）
     * @param {string} [taskData.task_type] - 任务类型（可选）
     * @param {string} [taskData.format] - 格式（可选）
     * @param {string} [taskData.source] - 来源（可选）
     * @param {number} [taskData.is_notice] - 是否为通知（可选，0 或 1）
     */
    static createTask({ title, started_at, ended_at, subject_name, mimetype, task_type, format, source, is_notice }) {
        const stmt = db.prepare(`
            INSERT INTO task_config (title, started_at, ended_at, subject_name, mimetype, task_type, format, source, is_notice)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(title, started_at, ended_at, subject_name || null, mimetype || null, task_type || null, format || null, source || null, is_notice !== undefined ? is_notice : 0);
    }

    /**
     * 更新任务配置
     * @param {number} task_id - 任务 ID
     * @param {Object} taskData - 任务配置数据
     * @param {string} [taskData.title] - 任务标题
     * @param {number} [taskData.started_at] - 开始时间戳
     * @param {number} [taskData.ended_at] - 结束时间戳
     * @param {string} [taskData.subject_name] - 科目名称
     * @param {string} [taskData.mimetype] - MIME 类型
     * @param {string} [taskData.task_type] - 任务类型
     * @param {string} [taskData.format] - 格式
     * @param {string} [taskData.source] - 来源
     * @param {number} [taskData.is_notice] - 是否为通知（0 或 1）
     * @returns {Object} 更新结果
     */
    static updateTask(task_id, { title, started_at, ended_at, subject_name, mimetype, task_type, format, source, is_notice }) {
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push("title = ?");
            values.push(title);
        }
        if (started_at !== undefined) {
            fields.push("started_at = ?");
            values.push(started_at);
        }
        if (ended_at !== undefined) {
            fields.push("ended_at = ?");
            values.push(ended_at);
        }
        if (subject_name !== undefined) {
            fields.push("subject_name = ?");
            values.push(subject_name);
        }
        if (mimetype !== undefined) {
            fields.push("mimetype = ?");
            values.push(mimetype);
        }
        if (task_type !== undefined) {
            fields.push("task_type = ?");
            values.push(task_type);
        }
        if (format !== undefined) {
            fields.push("format = ?");
            values.push(format);
        }
        if (source !== undefined) {
            fields.push("source = ?");
            values.push(source);
        }
        if (is_notice !== undefined) {
            fields.push("is_notice = ?");
            values.push(is_notice);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(task_id);
        const stmt = db.prepare(`UPDATE task_config SET ${fields.join(", ")} WHERE task_id = ?`);
        return stmt.run(...values);
    }

    /**
     * 删除任务配置
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteTask(task_id) {
        const stmt = db.prepare("DELETE FROM task_config WHERE task_id = ?");
        return stmt.run(task_id);
    }
}

module.exports = TaskConfigModel;
