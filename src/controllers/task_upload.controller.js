const { FileUploadError } = require("../error");
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
     * 根据上传 ID 获取上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static uploadFile(req, res) {
        const { accessPayload, file, body } = req;
        if (!file) {
            throw new FileUploadError();
        }
        const { taskId, uploadAt, uploadMessage, uploadFileName } = body;
        const { id } = accessPayload;
        const uploadTask = TaskUploadService.safeGetUploadById({ taskId: Number(taskId), uploadId: id });
        const uploadData = { uploadFilePath: file.filename, uploadMessage, uploadFileName, uploadAt };
        if (uploadTask == null) {
            TaskUploadService.createUpload({ taskId: Number(taskId), uploadId: id, ...uploadData });
            return res.status(201).end();
        } else {
            TaskUploadService.updateUpload({ taskId: Number(taskId), uploadId: id, uploadData })
            return res.status(204).end();
        }
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
}

module.exports = TaskUploadController;
