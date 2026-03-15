const express = require('express');
const TaskUploadController = require('../controllers/task_upload.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

/**
 * @route POST /list
 * @description 根据任务 ID 获取所有上传记录列表
 * @body {Object} requestBody - 请求体
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @returns {Array} 200 - 上传记录列表
 * @returns {number} taskId - 任务 ID
 * @returns {string} uploadId - 上传 ID
 * @returns {number} uploadAt - 上传时间戳
 * @returns {string|null} uploadFilePath - 上传文件路径（可选）
 * @returns {string|null} uploadMessage - 上传消息（可选）
 * @returns {400} - 参数验证失败时返回（如 taskId 无效）
 */
router.post('/list', TaskUploadController.getUploadsByTaskId);

/**
 * @route POST /search
 * @description 根据上传 ID 获取单个上传记录
 * @body {Object} requestBody - 请求体
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @body {string} requestBody.uploadId - 上传 ID（必填）
 * @returns {Object} 200 - 上传记录详情
 * @returns {number} taskId - 任务 ID
 * @returns {string} uploadId - 上传 ID
 * @returns {number} uploadAt - 上传时间戳
 * @returns {string|null} uploadFilePath - 上传文件路径（可选）
 * @returns {string|null} uploadMessage - 上传消息（可选）
 * @returns {400} - 参数验证失败时返回（如 taskId 或 uploadId 无效）
 * @returns {404} - 上传记录不存在时返回
 */
router.post('/search', TaskUploadController.getUploadById);

/**
 * @route POST /create
 * @description 创建新的上传记录
 * @body {Object} requestBody - 上传记录数据
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @body {string} requestBody.uploadId - 上传 ID（必填）
 * @body {number} requestBody.uploadAt - 上传时间戳（必填）
 * @body {string} [requestBody.uploadFilePath] - 上传文件路径（可选）
 * @body {string} [requestBody.uploadMessage] - 上传消息（可选）
 * @returns {Object} 201 - 创建成功，返回上传记录
 * @returns {number} taskId - 任务 ID
 * @returns {string} uploadId - 上传 ID
 * @returns {number} uploadAt - 上传时间戳
 * @returns {string|null} uploadFilePath - 上传文件路径（可选）
 * @returns {string|null} uploadMessage - 上传消息（可选）
 * @returns {400} - 参数验证失败时返回（如缺少必填字段）
 */
router.post('/create', TaskUploadController.createUpload);

/**
 * @route PATCH /update
 * @description 部分更新现有上传记录
 * @body {Object} requestBody - 更新数据
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @body {string} requestBody.uploadId - 上传 ID（必填）
 * @body {Object} requestBody.uploadData - 上传记录数据（所有字段可选，仅传递需要更新的字段）
 * @body {number} [requestBody.uploadData.uploadAt] - 上传时间戳
 * @body {string} [requestBody.uploadData.uploadFilePath] - 上传文件路径
 * @body {string} [requestBody.uploadData.uploadMessage] - 上传消息
 * @returns {void} 204 - 更新成功，无响应内容
 * @returns {400} - 参数验证失败时返回（如 taskId、uploadId 无效或 uploadAt 类型错误）
 * @returns {404} - 上传记录不存在时返回
 */
router.patch('/update', TaskUploadController.updateUpload);

/**
 * @route POST /delete
 * @description 删除上传记录
 * @body {Object} requestBody - 删除参数
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @body {string} requestBody.uploadId - 上传 ID（必填）
 * @returns {void} 204 - 删除成功，无响应内容
 * @returns {400} - 参数验证失败时返回（如 taskId 或 uploadId 无效）
 * @returns {404} - 上传记录不存在时返回
 */
router.post('/delete', TaskUploadController.deleteUpload);

module.exports = router;