const { FileUploadError, NotFoundError } = require("../error");
const TaskUploadService = require("../service/task_upload.service");
const { getMimeType, createReadStream } = require("../utils/file");
const { enqueueTaskDelete } = require("../utils/queue");
const { safeGetTaskPath } = require("../utils/uploads");

class TaskUploadController {
    /**
     * 根据任务 ID 获取所有上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getUploadsByTaskId(req, res) {
        const { taskId } = req.params;
        const uploads = TaskUploadService.getUploadsByTaskId({ taskId: Number(taskId) })
            .map(upload => {
                delete upload.uploadFilePath;
                return upload;
            });
        return res.json(uploads);
    }
    static getMyUploads(req, res) {
        const { accessPayload } = req;
        const { id } = accessPayload;
        const uploads = TaskUploadService.getUploadsByUploadId({ uploadId: id }).map(upload => {
            delete upload.uploadFilePath;
            return upload;
        });
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
        delete upload.uploadFilePath;
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
        const uploadData = { uploadFilePath: file.filename, uploadMessage, uploadFileName, uploadAt: Number(uploadAt) };
        if (uploadTask == null) {
            TaskUploadService.createUpload({ taskId: Number(taskId), uploadId: id, ...uploadData });
            return res.status(201).end();
        } else {
            TaskUploadService.updateUpload({ taskId: Number(taskId), uploadId: id, uploadData });
            enqueueTaskDelete({
                uploadFilePath: uploadTask.uploadFilePath,
                taskId: uploadTask.taskId
            });
            return res.status(204).end();
        }
    }
    /**
     * 删除上传记录
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static deleteUpload(req, res) {
        const { accessPayload, body } = req;
        const { taskId, uploadId } = body;
        const { id } = accessPayload;
        TaskUploadService.deleteUpload({ taskId, uploadId });
        const uploadTask = TaskUploadService.safeGetUploadById({ taskId: Number(taskId), uploadId: id });
        enqueueTaskDelete({
            uploadFilePath: uploadTask.uploadFilePath,
            taskId: uploadTask.taskId
        });
        return res.status(204).end();
    }
    /**
    * 
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    */
    static getStreamFile(req, res) {
        const { taskId, uploadId } = req.params;
        const uploadData = TaskUploadService.getUploadById({ taskId: Number(taskId), uploadId });
        const filePath = safeGetTaskPath( uploadData.uploadFilePath);
        if (filePath == null) {
            throw new NotFoundError();
        }
        const mimeType = getMimeType(filePath) ?? 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'private, max-age=600');
        createReadStream(filePath).pipe(res);
    }
}

module.exports = TaskUploadController;
