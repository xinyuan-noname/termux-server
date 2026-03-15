const db = require("../database/db");

class TaskUploadModel {

    /**
     * 根据 task_id 获取所有上传记录
     * @param {number} task_id - 任务 ID
     * @returns {Array} 上传记录列表
     */
    static getUploadsByTaskId(task_id) {
        const stmt = db.prepare("SELECT * FROM task_upload WHERE task_id = ?");
        return stmt.all(task_id);
    }

    /**
     * 根据 upload_id 获取上传记录
     * @param {number} task_id - 任务 ID
     * @param {string} upload_id - 上传 ID
     * @returns {Object|undefined} 上传记录对象
     */
    static getUploadById(task_id, upload_id) {
        const stmt = db.prepare("SELECT * FROM task_upload WHERE task_id = ? AND upload_id = ?");
        return stmt.get(task_id, upload_id);
    }

    /**
     * 创建新的上传记录
     * @param {Object} uploadData - 上传记录数据
     * @param {number} uploadData.task_id - 任务 ID
     * @param {string} uploadData.upload_id - 上传 ID
     * @param {number} uploadData.upload_at - 上传时间戳
     * @param {string} [uploadData.upload_file_path] - 上传文件路径（可选）
     * @param {string} [uploadData.upload_message] - 上传消息（可选）
     * @returns {Object} 创建结果
     */
    static createUpload({ task_id, upload_id, upload_at, upload_file_path, upload_message }) {
        const stmt = db.prepare(`
            INSERT INTO task_upload (task_id, upload_id, upload_at, upload_file_path, upload_message)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(task_id, upload_id, upload_at, upload_file_path || null, upload_message || null);
    }

    /**
     * 更新上传记录
     * @param {number} task_id - 任务 ID
     * @param {string} upload_id - 上传 ID
     * @param {Object} uploadData - 上传记录数据
     * @param {number} [uploadData.upload_at] - 上传时间戳
     * @param {string} [uploadData.upload_file_path] - 上传文件路径
     * @param {string} [uploadData.upload_message] - 上传消息
     * @returns {Object} 更新结果
     */
    static updateUpload(task_id, upload_id, { upload_at, upload_file_path, upload_message }) {
        const fields = [];
        const values = [];

        if (upload_at !== undefined) {
            fields.push("upload_at = ?");
            values.push(upload_at);
        }
        if (upload_file_path !== undefined) {
            fields.push("upload_file_path = ?");
            values.push(upload_file_path);
        }
        if (upload_message !== undefined) {
            fields.push("upload_message = ?");
            values.push(upload_message);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(task_id, upload_id);
        const stmt = db.prepare(`UPDATE task_upload SET ${fields.join(", ")} WHERE task_id = ? AND upload_id = ?`);
        return stmt.run(...values);
    }

    /**
     * 删除上传记录
     * @param {number} task_id - 任务 ID
     * @param {string} upload_id - 上传 ID
     * @returns {Object} 删除结果
     */
    static deleteUpload(task_id, upload_id) {
        const stmt = db.prepare("DELETE FROM task_upload WHERE task_id = ? AND upload_id = ?");
        return stmt.run(task_id, upload_id);
    }

    /**
     * 根据 task_id 删除所有上传记录
     * @param {number} task_id - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteUploadsByTaskId(task_id) {
        const stmt = db.prepare("DELETE FROM task_upload WHERE task_id = ?");
        return stmt.run(task_id);
    }
}

module.exports = TaskUploadModel;
