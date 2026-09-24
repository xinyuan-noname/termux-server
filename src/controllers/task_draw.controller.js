const TaskDrawService = require("../service/task_draw.service");
const { ValidationError } = require("../error");
const { toPositiveInteger } = require("../utils/validation");

class TaskDrawController {
    /**
     * 创建随机选人任务
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static createDraw(req, res) {
        const { id } = req.accessPayload;
        const { title, rangeUserList, reproducible, drawResult } = req.body;
        const result = TaskDrawService.createDrawTask({
            title,
            rangeUserList,
            reproducible,
            drawResult,
            source: id
        });
        return res.status(201).json(result.taskId);
    }

    /**
     * 获取随机选人任务详情
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getDraw(req, res) {
        const taskId = toPositiveInteger(req.params.taskId);
        if (taskId === null) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const task = TaskDrawService.getDrawTask({ taskId });
        return res.json(task);
    }

    /**
     * 更新随机选人任务
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static updateDraw(req, res) {
        const taskId = toPositiveInteger(req.body.taskId);
        if (taskId === null) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const { taskData } = req.body;
        return res.json(TaskDrawService.updateDrawTask({
            taskId,
            taskData,
            viewer: req.accessPayload
        }));
    }
}

module.exports = TaskDrawController;
