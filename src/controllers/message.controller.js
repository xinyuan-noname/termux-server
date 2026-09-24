const { NotFoundError } = require("../error");
const AssetService = require("../service/asset.service");
const MessageServer = require("../service/message.service");
const TaskConfigService = require("../service/task_config.service");
const logger = require("../logger");
const { generateRandomSafeString } = require("../utils/verification");

/**
 * 清理事项内容里已经不再被任何事项引用的图片
 * @param {string} removedContent - 被删除或被替换掉的事项内容
 */
async function cleanupToDoImages(removedContent) {
    if (!removedContent) return;
    try {
        const toDoList = await MessageServer.getPublicToDoList();
        const deleted = AssetService.deleteUnusedImages({
            removedContent,
            otherContents: toDoList.map((item) => item.content)
        });
        if (deleted > 0) {
            logger.info(`清理事项图片${deleted}张`);
        }
    } catch (error) {
        // 图片清理失败不影响事项本身的增删改
        logger.warn("清理事项图片失败", error);
    }
}

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
    static async getPublicToDoList(req, res) {
        const result = await MessageServer.getPublicToDoList();
        return res.json(result);
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async createPublicToDoItem(req, res) {
        const { position } = req.accessPayload;
        const { title, content, ts } = req.body;
        const itemId = generateRandomSafeString();
        await MessageServer.setPublicToDoItem({ itemId, title, content, ts, source: position })
        return res.status(201).end();
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async updatePublicToDoItem(req, res) {
        const { itemId, title, content } = req.body;
        const toDoItem = await MessageServer.getPublicToDoItem({ itemId });
        if (toDoItem == null) {
            throw new NotFoundError();
        }
        await MessageServer.setPublicToDoItem({ itemId, title, content, ts: toDoItem.ts, source: toDoItem.source })
        // 内容被替换后, 旧内容里引用的图片可能已经没有事项再用
        if (toDoItem.content !== content) {
            await cleanupToDoImages(toDoItem.content);
        }
        return res.status(204).end();
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async deletePublicToDoItem(req, res) {
        const { itemId } = req.body;
        const toDoItem = await MessageServer.getPublicToDoItem({ itemId });
        await MessageServer.deletePublicToDoItem({ itemId });
        if (toDoItem != null) {
            await cleanupToDoImages(toDoItem.content);
        }
        return res.status(204).end();
    }
}
module.exports = MessageController;