const { UPLOAD_DOCUMENT_VIEW_STORAGE_KEY } = require("../config/uploads");
const { ValidationError, NotFoundError } = require("../error");
const logger = require("../logger");
const TaskUploadModel = require("../models/task_upload.model");
const proxyRedis = require("../redis/proxy");
const { isUnsignedIntegerString } = require("../utils/validation");

class TaskUploadService {
    static getDocumentViewKey({ taskId, uploadId }) {
        if (!Number.isInteger(taskId)) {
            return null;
        }
        if (!isUnsignedIntegerString(uploadId)) {
            return null;
        }
        return UPLOAD_DOCUMENT_VIEW_STORAGE_KEY
            .replace("{taskId}", taskId)
            .replace("{uploadId}", uploadId);
    }
    static async getDocumentViewFile({ taskId, uploadId }) {
        const key = TaskUploadService.getDocumentViewKey({ taskId, uploadId });
        if (!key) {
            throw new ValidationError('Invalid task id or upload id');
        }
        const result = await proxyRedis.get(key);
        if (!result) {
            throw new NotFoundError();
        }
        return result;
    }
    /**
     * 根据任务 ID 获取所有上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     */
    static getUploadsByTaskId({ taskId }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const list = TaskUploadModel.getUploadsByTaskId(taskId);
        return list.map(upload => TaskUploadService.#parseUpload(upload));
    }
    /**
     * 根据任务 ID 获取所有上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.uploadId - 任务 ID
     * @returns {Array} 上传记录列表（驼峰命名）
     */
    static getUploadsByUploadId({ uploadId }) {
        if (!isUnsignedIntegerString(uploadId)) {
            throw new ValidationError("Invalid upload id", "uploadId");
        }
        const list = TaskUploadModel.getUploadsByUploadId(uploadId);
        return list.map(upload => TaskUploadService.#parseUpload(upload));
    }

    /**
     * 根据上传 ID 获取上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.uploadId - 上传 ID
     */
    static getUploadById({ taskId, uploadId } = {}) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        if (!isUnsignedIntegerString(uploadId)) {
            throw new ValidationError("Invalid upload id", "uploadId");
        }
        const upload = TaskUploadModel.getUploadById(taskId, uploadId);
        if (!upload) {
            throw new NotFoundError(`Upload not found: ${uploadId}`);
        }
        return TaskUploadService.#parseUpload(upload);
    }
    /**
     * 根据上传 ID 获取上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.uploadId - 上传 ID
     */
    static safeGetUploadById({ taskId, uploadId } = {}) {
        try {
            return TaskUploadService.getUploadById({ taskId, uploadId })
        } catch (error) {
            logger.warn(error);
            return null;
        }
    }

    /**
     * 创建新的上传记录
     * @param {Object} params - 上传记录参数
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.uploadId - 上传 ID
     * @param {number} params.uploadAt - 上传时间戳
     * @param {string} [params.uploadFilePath] - 上传文件路径（可选）
     * @param {string} [params.uploadMessage] - 上传消息（可选）
     * @param {string} [params.uploadFileName] - 上传文件名（可选）
     */
    static createUpload({ taskId, uploadId, uploadAt, uploadFilePath, uploadMessage, uploadFileName }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        if (!isUnsignedIntegerString(uploadId)) {
            throw new ValidationError("Invalid upload id", "uploadId");
        }
        if (!Number.isInteger(uploadAt)) {
            throw new ValidationError("Invalid upload_at", "uploadAt");
        }
        TaskUploadModel.createUpload({
            task_id: taskId,
            upload_id: uploadId,
            upload_at: uploadAt,
            upload_file_path: uploadFilePath,
            upload_message: uploadMessage,
            upload_file_name: uploadFileName
        });
    }

    /**
     * 更新上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.uploadId - 上传 ID
     * @param {Object} params.uploadData - 上传记录数据
     * @param {number} [params.uploadData.uploadAt] - 上传时间戳
     * @param {string} [params.uploadData.uploadFilePath] - 上传文件路径
     * @param {string} [params.uploadData.uploadMessage] - 上传消息
     * @param {string} [params.uploadData.uploadFileName] - 上传文件名
     * @returns {Object} 更新后的上传记录
     */
    static updateUpload({ taskId, uploadId, uploadData }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        if (!isUnsignedIntegerString(uploadId)) {
            throw new ValidationError("Invalid upload id", "uploadId");
        }

        const existingUpload = TaskUploadModel.getUploadById(taskId, uploadId);
        if (!existingUpload) {
            throw new NotFoundError(`Upload not found: ${uploadId}`);
        }

        if (uploadData.uploadAt !== undefined && typeof uploadData.uploadAt !== "number") {
            throw new ValidationError("Invalid upload_at", "uploadAt");
        }

        TaskUploadModel.updateUpload(taskId, uploadId, {
            upload_at: uploadData.uploadAt,
            upload_file_path: uploadData.uploadFilePath,
            upload_message: uploadData.uploadMessage,
            upload_file_name: uploadData.uploadFileName
        });
    }

    /**
     * 删除上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.uploadId - 上传 ID
     * @returns {Object} 删除结果
     */
    static deleteUpload({ taskId, uploadId }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        if (!isUnsignedIntegerString(uploadId)) {
            throw new ValidationError("Invalid upload id", "uploadId");
        }

        const upload = TaskUploadModel.getUploadById(taskId, uploadId);
        if (!upload) {
            throw new NotFoundError(`Upload not found: ${uploadId}`);
        }

        return TaskUploadModel.deleteUpload(taskId, uploadId);
    }

    /**
     * 根据任务 ID 删除所有上传记录
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @returns {Object} 删除结果
     */
    static deleteUploadsByTaskId({ taskId }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }

        return TaskUploadModel.deleteUploadsByTaskId(taskId);
    }

    /**
     * 将数据库对象转换为驼峰命名格式
     * @private
     * @param {Object} upload - 数据库对
     */
    static #parseUpload(upload) {
        const { task_id, upload_id, upload_at, upload_file_path, upload_message, upload_file_name } = upload;
        return {
            taskId: task_id,
            uploadId: upload_id,
            uploadAt: upload_at,
            uploadFilePath: upload_file_path,
            uploadMessage: upload_message,
            uploadFileName: upload_file_name
        };
    }
}

module.exports = TaskUploadService;
