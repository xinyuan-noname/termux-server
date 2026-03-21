const { ValidationError, NotFoundError } = require("../error");
const TaskConfigModel = require("../models/task_config.model");

class TaskConfigService {

    /**
     * 根据 ID 获取任务配置
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @returns {Object} 任务配置对象（驼峰命名）
     */
    static getTaskById({ taskId }) {
        if (!taskId || typeof taskId !== "number") {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const task = TaskConfigModel.getTaskById(taskId);
        if (!task) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }
        return TaskConfigService.#parseTask(task);
    }

    /**
     * 获取所有任务配置
     */
    static getAllTasks() {
        const list = TaskConfigModel.getAllTasks();
        return list.map(task => TaskConfigService.#parseTask(task));
    }

    /**
     * 根据科目名称获取任务配置列表
     * @param {Object} params - 参数对象
     * @param {string} params.subjectName - 科目名称
     * @returns {Array} 任务配置列表（驼峰命名）
     */
    static getTasksBySubject({ subjectName }) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }
        const list = TaskConfigModel.getTasksBySubject(subjectName);
        return list.map(task => TaskConfigService.#parseTask(task));
    }

    /**
     * 创建新的任务配置
     * @param {Object} params - 任务配置参数
     * @param {string} params.title - 任务标题
     * @param {number} params.startedAt - 开始时间戳
     * @param {number} params.endedAt - 结束时间戳
     * @param {string} [params.subjectName] - 科目名称（可选）
     * @param {string} [params.mimetype] - MIME 类型（可选）
     * @param {string} [params.taskType] - 任务类型（可选）
     * @param {string} [params.format] - 格式（可选）
     * @param {string} [params.source] - 来源（可选）
     * @param {number} [params.isNotice] - 是否为通知（可选，0 或 1）
     * @param {string} [params.description] - 描述（可选）
     * @param {Array} [params.drawResult] - 抽签结果数组（可选）
     */
    static createTask({ title, startedAt, endedAt, subjectName, mimetype, taskType, format, source, isNotice, description, drawResult }) {
        if (!title || typeof title !== "string") {
            throw new ValidationError("Invalid title", "title");
        }
        if (!startedAt || typeof startedAt !== "number") {
            throw new ValidationError("Invalid started_at", "startedAt");
        }
        if (!endedAt || typeof endedAt !== "number") {
            throw new ValidationError("Invalid ended_at", "endedAt");
        }
        if (endedAt <= startedAt) {
            throw new ValidationError("ended_at must be greater than started_at", "endedAt");
        }

        const result = TaskConfigModel.createTask({
            title,
            started_at: startedAt,
            ended_at: endedAt,
            subject_name: subjectName,
            mimetype,
            task_type: taskType,
            format,
            source,
            is_notice: isNotice,
            description,
            draw_result: drawResult
        });

        return { taskId: result.lastInsertRowid };
    }

    /**
     * 更新任务配置
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {Object} params.taskData - 任务配置数据
     * @param {string} [params.taskData.title] - 任务标题
     * @param {number} [params.taskData.startedAt] - 开始时间戳
     * @param {number} [params.taskData.endedAt] - 结束时间戳
     * @param {string} [params.taskData.subjectName] - 科目名称
     * @param {string} [params.taskData.mimetype] - MIME 类型
     * @param {string} [params.taskData.taskType] - 任务类型
     * @param {string} [params.taskData.format] - 格式
     * @param {string} [params.taskData.source] - 来源
     * @param {number} [params.taskData.isNotice] - 是否为通知（0 或 1）
     * @param {string} [params.taskData.description] - 描述
     * @param {Array} [params.taskData.drawResult] - 抽签结果数组
     * @returns {Object} 更新后的任务配置
     */
    static updateTask({ taskId, taskData }) {
        if (!taskId || typeof taskId !== "number") {
            throw new ValidationError("Invalid task id", "taskId");
        }

        // 验证是否存在
        const existingTask = TaskConfigModel.getTaskById(taskId);
        if (!existingTask) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }

        // 验证时间字段
        if (taskData.startedAt !== undefined && typeof taskData.startedAt !== "number") {
            throw new ValidationError("Invalid started_at", "startedAt");
        }
        if (taskData.endedAt !== undefined && typeof taskData.endedAt !== "number") {
            throw new ValidationError("Invalid ended_at", "endedAt");
        }
        if (taskData.startedAt !== undefined && taskData.endedAt !== undefined && taskData.endedAt <= taskData.startedAt) {
            throw new ValidationError("ended_at must be greater than started_at", "endedAt");
        }

        TaskConfigModel.updateTask(taskId, {
            title: taskData.title,
            started_at: taskData.startedAt,
            ended_at: taskData.endedAt,
            subject_name: taskData.subjectName,
            mimetype: taskData.mimetype,
            task_type: taskData.taskType,
            format: taskData.format,
            source: taskData.source,
            is_notice: taskData.isNotice,
            description: taskData.description,
            draw_result: taskData.drawResult
        });

        return TaskConfigService.getTaskById({ taskId });
    }

    /**
     * 删除任务配置
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteTask({ taskId }) {
        if (!taskId || typeof taskId !== "number") {
            throw new ValidationError("Invalid task id", "taskId");
        }

        const task = TaskConfigModel.getTaskById(taskId);
        if (!task) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }

        return TaskConfigModel.deleteTask(taskId);
    }

    /**
     * 将数据库对象转换为驼峰命名格式
     * @private
     * @param {Object} task - 数据库对象
     */
    static #parseTask(task) {
        const { task_id, title, started_at, ended_at, subject_name, mimetype, task_type, format, source, is_notice, description, draw_result } = task;
        return {
            taskId: task_id,
            title,
            startedAt: started_at,
            endedAt: ended_at,
            subjectName: subject_name,
            mimetype,
            taskType: task_type,
            format,
            source,
            isNotice: is_notice,
            description,
            drawResult: draw_result ? JSON.parse(draw_result) : null
        };
    }
}

module.exports = TaskConfigService;
