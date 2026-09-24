const db = require("../database/db");
const TaskType = require("../enum/task_type");
const { ValidationError, NotFoundError, ForbiddenError } = require("../error");
const logger = require("../logger");
const TaskConfigModel = require("../models/task_config.model");
const TaskDrawModel = require("../models/task_draw.model");
const { DRAW_TASK_DURATION, DRAW_RANGE_MAX_LENGTH } = require("../config/task");
const { isUnsignedIntegerString } = require("../utils/validation");

// 一次抽取结果最多保存的轮数, 防止前端异常导致单个任务无限增长
const DRAW_ROUND_MAX_LENGTH = 500;
// 单轮抽取最多保存的人数
const DRAW_ROUND_USER_MAX_LENGTH = 2000;
// 任务名长度上限
const DRAW_TITLE_MAX_LENGTH = 100;

class TaskDrawService {

    /**
     * 解析并校验抽取范围用户列表
     * @param {Array} rangeUserList - 抽取范围用户列表
     * @returns {Array<{id:string,username:string}>|undefined} 规范化后的用户列表
     */
    static #parseRangeUserList(rangeUserList) {
        if (rangeUserList === undefined) return undefined;
        if (rangeUserList === null) return null;
        if (!Array.isArray(rangeUserList)) {
            throw new ValidationError("rangeUserList must be an array", "rangeUserList");
        }
        if (rangeUserList.length > DRAW_RANGE_MAX_LENGTH) {
            throw new ValidationError(`rangeUserList length must be at most ${DRAW_RANGE_MAX_LENGTH}`, "rangeUserList");
        }
        const seen = new Set();
        const result = [];
        for (const item of rangeUserList) {
            const id = item && typeof item === "object" ? item.id : undefined;
            if (!isUnsignedIntegerString(id)) {
                throw new ValidationError(`Invalid user id in rangeUserList: ${id}`, "rangeUserList");
            }
            if (seen.has(id)) continue;
            seen.add(id);
            const username = item.username;
            result.push({ id, username: typeof username === "string" ? username : "" });
        }
        return result;
    }

    /**
     * 解析并校验抽取结果
     * @param {Array<Array<string>>} drawResult - 抽取结果, 外层为抽取轮次
     * @returns {Array<Array<string>>|null|undefined} 规范化后的抽取结果
     */
    static #parseDrawResult(drawResult) {
        if (drawResult === undefined) return undefined;
        if (drawResult === null) return null;
        if (!Array.isArray(drawResult)) {
            throw new ValidationError("drawResult must be an array", "drawResult");
        }
        if (drawResult.length > DRAW_ROUND_MAX_LENGTH) {
            throw new ValidationError(`drawResult round count must be at most ${DRAW_ROUND_MAX_LENGTH}`, "drawResult");
        }
        return drawResult.map((round) => {
            if (!Array.isArray(round)) {
                throw new ValidationError("each drawResult round must be an array", "drawResult");
            }
            if (round.length > DRAW_ROUND_USER_MAX_LENGTH) {
                throw new ValidationError(`each drawResult round must contain at most ${DRAW_ROUND_USER_MAX_LENGTH} users`, "drawResult");
            }
            return round.map((id) => {
                if (!isUnsignedIntegerString(id)) {
                    throw new ValidationError(`Invalid user id in drawResult: ${id}`, "drawResult");
                }
                return id;
            });
        });
    }

    /**
     * 校验任务名
     * @param {string} title - 任务名
     * @returns {string} 校验后的任务名
     */
    static #parseTitle(title) {
        if (typeof title !== "string" || title.length === 0) {
            throw new ValidationError("Invalid title", "title");
        }
        if (title.length > DRAW_TITLE_MAX_LENGTH) {
            throw new ValidationError(`title length must be at most ${DRAW_TITLE_MAX_LENGTH}`, "title");
        }
        return title;
    }

    /**
     * 校验请求方是否有权修改该任务
     * @param {Object} task - task_config 记录
     * @param {Object} viewer - 请求方信息
     * @param {string} viewer.id - 请求方用户 ID
     * @param {string} [viewer.userType] - 请求方用户类型
     */
    static assertWritable(task, { id, userType } = {}) {
        if (task.source === id) return;
        // 兼容历史数据中 source 记录的是角色而非用户 ID 的情况
        if (task.source === userType) return;
        throw new ForbiddenError("You are not the owner of this task");
    }

    /**
     * 创建随机选人任务
     * @param {Object} params - 参数对象
     * @param {string} params.title - 任务名
     * @param {Array<{id:string,username:string}>} [params.rangeUserList] - 抽取范围
     * @param {boolean} [params.reproducible] - 成员是否可重复抽取
     * @param {Array<Array<string>>} [params.drawResult] - 已有的抽取结果
     * @param {string} params.source - 创建者 ID
     * @returns {{taskId:number}} 创建结果
     */
    static createDrawTask({ title, rangeUserList, reproducible, drawResult, source }) {
        const safeTitle = TaskDrawService.#parseTitle(title);
        const safeRangeUserList = TaskDrawService.#parseRangeUserList(rangeUserList);
        const safeDrawResult = TaskDrawService.#parseDrawResult(drawResult);
        if (!isValidSource(source)) {
            throw new ValidationError("Invalid source", "source");
        }

        const startedAt = Date.now();
        const create = db.transaction(() => {
            const result = TaskConfigModel.createTask({
                title: safeTitle,
                started_at: startedAt,
                ended_at: startedAt + DRAW_TASK_DURATION,
                task_type: TaskType.draw,
                source,
                is_notice: 0,
                draw_result: safeDrawResult ?? null
            });
            const taskId = Number(result.lastInsertRowid);
            TaskDrawModel.createDraw({
                task_id: taskId,
                reproducible: reproducible === true,
                range_user_list: safeRangeUserList ?? null
            });
            return taskId;
        });
        const taskId = create();
        logger.info(`创建随机选人任务${taskId}`, { source, rangeCount: safeRangeUserList?.length ?? 0 });
        return { taskId };
    }

    /**
     * 获取随机选人任务详情
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @returns {Object} 随机选人任务详情
     */
    static getDrawTask({ taskId }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const task = TaskConfigModel.getTaskById(taskId);
        if (!task) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }
        if (task.task_type !== TaskType.draw) {
            throw new ValidationError(`Task ${taskId} is not a draw task`, "taskId");
        }
        const draw = TaskDrawModel.getDrawByTaskId(taskId);
        return TaskDrawService.#parseDrawTask(task, draw);
    }

    /**
     * 获取随机选人任务详情, 任务不存在或类型不符时返回 null
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @returns {Object|null} 随机选人任务详情
     */
    static safeGetDrawTask({ taskId } = {}) {
        try {
            return TaskDrawService.getDrawTask({ taskId });
        } catch (error) {
            return null;
        }
    }

    /**
     * 更新随机选人任务
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {Object} params.taskData - 待更新数据
     * @param {string} [params.taskData.title] - 任务名
     * @param {Array<{id:string,username:string}>} [params.taskData.rangeUserList] - 抽取范围
     * @param {boolean} [params.taskData.reproducible] - 成员是否可重复抽取
     * @param {Array<Array<string>>} [params.taskData.drawResult] - 抽取结果
     * @param {Object} params.viewer - 请求方信息
     * @returns {Object} 更新后的任务详情
     */
    static updateDrawTask({ taskId, taskData = {}, viewer }) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const task = TaskConfigModel.getTaskById(taskId);
        if (!task) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }
        if (task.task_type !== TaskType.draw) {
            throw new ValidationError(`Task ${taskId} is not a draw task`, "taskId");
        }
        TaskDrawService.assertWritable(task, viewer);

        const safeTitle = taskData.title === undefined ? undefined : TaskDrawService.#parseTitle(taskData.title);
        const safeRangeUserList = TaskDrawService.#parseRangeUserList(taskData.rangeUserList);
        const safeDrawResult = TaskDrawService.#parseDrawResult(taskData.drawResult);
        if (taskData.reproducible !== undefined && typeof taskData.reproducible !== "boolean") {
            throw new ValidationError("Invalid reproducible", "reproducible");
        }

        const update = db.transaction(() => {
            if (safeTitle !== undefined || safeDrawResult !== undefined) {
                TaskConfigModel.updateTask(taskId, {
                    title: safeTitle,
                    draw_result: safeDrawResult
                });
            }
            if (safeRangeUserList !== undefined || taskData.reproducible !== undefined) {
                TaskDrawModel.updateDraw(taskId, {
                    reproducible: taskData.reproducible,
                    range_user_list: safeRangeUserList
                });
            }
        });
        update();
        return TaskDrawService.getDrawTask({ taskId });
    }

    /**
     * 将数据库记录转换为驼峰命名的任务详情
     * @private
     * @param {Object} task - task_config 记录
     * @param {Object} [draw] - task_draw 记录
     * @returns {Object} 任务详情
     */
    static #parseDrawTask(task, draw) {
        const { task_id, title, started_at, ended_at, source, draw_result } = task;
        let drawResult = null;
        if (draw_result) {
            try {
                drawResult = JSON.parse(draw_result);
            } catch (error) {
                logger.warn(`随机选人任务${task_id}的抽取结果解析失败`, error);
            }
        }
        let rangeUserList = null;
        if (draw?.range_user_list) {
            try {
                rangeUserList = JSON.parse(draw.range_user_list);
            } catch (error) {
                logger.warn(`随机选人任务${task_id}的抽取范围解析失败`, error);
            }
        }
        return {
            taskId: task_id,
            taskType: TaskType.draw,
            title,
            startedAt: started_at,
            endedAt: ended_at,
            createdAt: started_at,
            source,
            reproducible: draw ? draw.reproducible === 1 : false,
            rangeUserList: Array.isArray(rangeUserList) ? rangeUserList : [],
            drawResult: Array.isArray(drawResult) ? drawResult : [],
            selectedIdList: Array.isArray(drawResult) ? [...new Set(drawResult.flat())] : []
        };
    }
}

/**
 * 校验任务来源字段
 * @param {string} source - 创建者 ID
 * @returns {boolean} 是否合法
 */
function isValidSource(source) {
    return typeof source === "string" && source.length > 0 && source.length <= 64;
}

module.exports = TaskDrawService;
