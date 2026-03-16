const TaskConfigService = require("../service/task_config.service");

class TaskConfigController {
    /**
     * 获取所有任务配置
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getAllTasks(req, res) {
        const { id, userType } = req.accessPayload;
        const tasks = TaskConfigService.getAllTasks().filter((task) => {
            return task.source === id || task.source === userType || task.source == null;
        });
        return res.json(tasks);
    }

    /**
     * 根据 ID 获取任务配置
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getTaskById(req, res) {
        const { id: taskId } = req.params;
        const task = TaskConfigService.getTaskById({ taskId });
        return res.json(task);
    }

    /**
     * 创建新的任务配置
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static createTask(req, res) {
        const { title, startedAt, endedAt, subjectName, mimetype, taskType, format, source, isNotice, description, drawResult } = req.body;
        const result = TaskConfigService.createTask({ title, startedAt, endedAt, subjectName, mimetype, taskType, format, source, isNotice, description, drawResult });
        return res.status(201).json(result.taskId);
    }

    /**
     * 更新任务配置
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static updateTask(req, res) {
        const { taskId, taskData } = req.body;
        TaskConfigService.updateTask({ taskId, taskData });
        return res.status(204).end();
    }

    /**
     * 删除任务配置
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static deleteTask(req, res) {
        const { taskId } = req.body;
        TaskConfigService.deleteTask({ taskId });
        return res.status(204).end();
    }
}

module.exports = TaskConfigController;
