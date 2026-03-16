const MessageServer = require("../service/message.service");
const TaskConfigService = require("../service/task_config.service");

class MessageController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getAllNoticeTasks(req, res) {
        const tasks = TaskConfigService.getAllTasks().filter((task) => task.isNotice);
        return res.json(tasks);
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getAllRemind(req, res) {
        const { id } = req.accessPayload;
        const result = MessageServer.getRemindPending({ userId: id });
        return res.json(result);
    }
}
module.exports = MessageController;