const express = require('express');
const TaskConfigController = require('../controllers/task_config.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

/**
 * @route POST /list
 * @description 获取所有任务配置列表
 * @body {Object} 请求体（可选）- 可包含分页或过滤参数
 * @returns {Array} tasks - 任务配置列表
 */
router.post('/list', TaskConfigController.getAllTasks);

/**
 * @route POST /:id
 * @description 根据 ID 获取单个任务配置
 * @body {number} id - 任务配置 ID（通过 URL 参数）
 * @returns {Object} task - 任务配置详情
 */
router.post('/:id', TaskConfigController.getTaskById);


/**
 * @route POST /create
 * @description 创建新的任务配置
 * @body {Object} taskData - 任务配置数据
 * @body {string} taskData.task_name - 任务名称
 * @body {string} taskData.subject_id - 科目 ID
 * @body {string} taskData.task_type - 任务类型
 * @body {Object} taskData.config - 任务配置（JSON 对象）
 * @body {string} taskData.description - 任务描述（可选）
 * @returns {Object} task - 创建后的任务配置
 * @returns {number} status 201 - 创建成功状态码
 */
router.post('/create', TaskConfigController.createTask);

/**
 * @route PATCH /update
 * @description 部分更新现有任务配置
 * @body {Object} requestBody - 更新数据
 * @body {number} requestBody.taskId - 任务 ID（必填）
 * @body {Object} requestBody.taskData - 任务配置数据（所有字段可选，仅传递需要更新的字段）
 * @body {string} [requestBody.taskData.title] - 任务标题
 * @body {number} [requestBody.taskData.startedAt] - 开始时间戳
 * @body {number} [requestBody.taskData.endedAt] - 结束时间戳（必须大于 startedAt）
 * @body {string} [requestBody.taskData.subjectName] - 科目名称
 * @body {string} [requestBody.taskData.mimetype] - MIME 类型
 * @body {string} [requestBody.taskData.taskType] - 任务类型
 * @returns {Object} 200 - 更新后的任务配置
 * @returns {number} taskId - 任务 ID
 * @returns {string} title - 任务标题
 * @returns {number} startedAt - 开始时间戳
 * @returns {number} endedAt - 结束时间戳
 * @returns {string|null} subjectName - 科目名称（可选）
 * @returns {string|null} mimetype - MIME 类型（可选）
 * @returns {string|null} taskType - 任务类型（可选）
 * @returns {400} - 参数验证失败时返回
 * @returns {404} - 任务不存在时返回
 */
router.patch('/update', TaskConfigController.updateTask);

/**
 * @route POST /delete
 * @description 删除任务配置
 * @body {number} id - 要删除的任务配置 ID
 * @returns {Object} message - 删除成功消息
 */
router.post('/delete', TaskConfigController.deleteTask);

module.exports = router;