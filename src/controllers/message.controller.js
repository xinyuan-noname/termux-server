const { NotFoundError } = require("../error");
const MessageServer = require("../service/message.service");
const TaskConfigService = require("../service/task_config.service");
const { generateRandomSafeString } = require("../utils/verification");

class MessageController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getAllNoticeTasks(req, res) {
        const tasks = TaskConfigService.getAllTasks().filter((task) =>
            task.isNotice
            && task.endedAt >= Date.now()
            && task.startedAt <= Date.now()
        );
        return res.json(tasks);
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async getAllRemind(req, res) {
        const { id } = req.accessPayload;
        const result = await MessageServer.getRemindPending({ userId: id });
        return res.json(result);
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async getToDoList(req, res) {
        const result = await MessageServer.getPublicToDoList();
        return res.json(result);
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async addToDoItem(req, res) {
        const { position } = req.accessPayload;
        const { title, content, ts } = req.body;
        const itemId = generateRandomSafeString();
        await MessageServer.setPublicToDoItem({ itemId, title, content, ts, source: position })
        return res.json({ itemId });
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async updateToDoItem(req, res) {
        const { itemId, title, content } = req.body;
        const toDoItem = await MessageServer.getPublicToDoItem({ itemId });
        if (toDoItem == null) {
            throw new NotFoundError();
        }
        await MessageServer.setPublicToDoItem({ itemId, title, content, ts: toDoItem.ts, source: toDoItem.source })
        return res.status(204).end();
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async deleteToDoItem(req, res) {
        const { itemId } = req.body;
        await MessageServer.deletePublicToDoItem({ itemId });
        return res.status(204).end();
    }
}
module.exports = MessageController;