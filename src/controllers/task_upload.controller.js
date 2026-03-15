const TaskUploadService = require("../service/task_upload.service");

class TaskUploadController {
    /**
     * 根据任务 ID 获取所有上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getUploadsByTaskId(req, res) {
        const { taskId } = req.body;
        const uploads = TaskUploadService.getUploadsByTaskId({ taskId });
        return res.json(uploads);
    }

    /**
     * 根据上传 ID 获取上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getUploadById(req, res) {
        const { taskId, uploadId } = req.body;
        const upload = TaskUploadService.getUploadById({ taskId, uploadId });
        return res.json(upload);
    }

    /**
     * 创建新的上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static createUpload(req, res) {
        const { taskId, uploadId, uploadAt, uploadFilePath, uploadMessage } = req.body;
        const upload = TaskUploadService.createUpload({ taskId, uploadId, uploadAt, uploadFilePath, uploadMessage });
        return res.status(201).json(upload);
    }

    /**
     * 更新上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static updateUpload(req, res) {
        const { taskId, uploadId, uploadData } = req.body;
        TaskUploadService.updateUpload({ taskId, uploadId, uploadData });
        return res.status(204).end();
    }

    /**
     * 删除上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static deleteUpload(req, res) {
        const { taskId, uploadId } = req.body;
        TaskUploadService.deleteUpload({ taskId, uploadId });
        return res.status(204).end();
    }

    /**
     * 根据任务 ID 删除所有上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static deleteUploadsByTaskId(req, res) {
        const { taskId } = req.body;
        TaskUploadService.deleteUploadsByTaskId({ taskId });
        return res.status(204).end();
    }
}

module.exports = TaskUploadController;
