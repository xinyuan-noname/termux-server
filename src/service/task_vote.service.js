const db = require("../database/db");
const TaskType = require("../enum/task_type");
const {
    ValidationError,
    NotFoundError,
    ForbiddenError,
    ConflictError
} = require("../error");
const logger = require("../logger");
const TaskConfigModel = require("../models/task_config.model");
const TaskVoteModel = require("../models/task_vote.model");
const GroupModel = require("../models/group.model");
const {
    VOTE_DEFAULT_DURATION,
    VOTE_MIN_DURATION,
    VOTE_MAX_DURATION,
    VOTE_OPTION_MAX_LENGTH,
    VOTE_OPTION_CONTENT_MAX_LENGTH,
    VOTE_TITLE_MAX_LENGTH,
    VOTE_VOTER_MAX_LENGTH,
    VOTE_MAX_CHOICES_LIMIT
} = require("../config/task");
const { isUnsignedIntegerString } = require("../utils/validation");

// "我的投票"列表最多返回的条数
const VOTE_LIST_MAX_LENGTH = 100;

class TaskVoteService {

    /**
     * 校验投票标题
     * @param {string} title - 投票标题
     * @returns {string} 校验后的标题
     */
    static #parseTitle(title) {
        if (typeof title !== "string") {
            throw new ValidationError("Invalid title", "title");
        }
        const safeTitle = title.trim();
        if (safeTitle.length === 0 || safeTitle.length > VOTE_TITLE_MAX_LENGTH) {
            throw new ValidationError(`title length must be between 1 and ${VOTE_TITLE_MAX_LENGTH}`, "title");
        }
        return safeTitle;
    }

    /**
     * 校验投票选项列表
     * @param {Array<string>} options - 选项内容列表
     * @returns {Array<string>} 校验后的选项列表
     */
    static #parseOptions(options) {
        if (!Array.isArray(options)) {
            throw new ValidationError("options must be an array", "options");
        }
        if (options.length < 2 || options.length > VOTE_OPTION_MAX_LENGTH) {
            throw new ValidationError(`options length must be between 2 and ${VOTE_OPTION_MAX_LENGTH}`, "options");
        }
        const seen = new Set();
        return options.map((option) => {
            if (typeof option !== "string") {
                throw new ValidationError("each option must be a string", "options");
            }
            const content = option.trim();
            if (content.length === 0 || content.length > VOTE_OPTION_CONTENT_MAX_LENGTH) {
                throw new ValidationError(`each option length must be between 1 and ${VOTE_OPTION_CONTENT_MAX_LENGTH}`, "options");
            }
            if (seen.has(content)) {
                throw new ValidationError(`duplicated option: ${content}`, "options");
            }
            seen.add(content);
            return content;
        });
    }

    /**
     * 校验参与投票的用户 ID 列表
     * @param {Array<string>} voters - 参与投票的用户 ID 列表
     * @returns {Array<string>} 校验后的用户 ID 列表
     */
    static #parseVoters(voters) {
        if (!Array.isArray(voters)) {
            throw new ValidationError("voters must be an array", "voters");
        }
        if (voters.length === 0) {
            throw new ValidationError("voters must not be empty", "voters");
        }
        if (voters.length > VOTE_VOTER_MAX_LENGTH) {
            throw new ValidationError(`voters length must be at most ${VOTE_VOTER_MAX_LENGTH}`, "voters");
        }
        const seen = new Set();
        const result = [];
        for (const voterId of voters) {
            if (!isUnsignedIntegerString(voterId)) {
                throw new ValidationError(`Invalid voter id: ${voterId}`, "voters");
            }
            if (seen.has(voterId)) continue;
            seen.add(voterId);
            result.push(voterId);
        }
        return result;
    }

    /**
     * 校验多选配置
     * @param {boolean} multiple - 是否多选
     * @param {number} [maxChoices] - 最多可选数量
     * @param {number} optionCount - 选项数量
     * @returns {{multiple:boolean,maxChoices:number|null}} 校验后的多选配置
     */
    static #parseChoice({ multiple = false, maxChoices, optionCount }) {
        if (typeof multiple !== "boolean") {
            throw new ValidationError("Invalid multiple", "multiple");
        }
        if (!multiple) {
            return { multiple: false, maxChoices: null };
        }
        if (maxChoices === undefined || maxChoices === null) {
            return { multiple: true, maxChoices: optionCount };
        }
        if (!Number.isInteger(maxChoices) || maxChoices < 1 || maxChoices > Math.min(optionCount, VOTE_MAX_CHOICES_LIMIT)) {
            throw new ValidationError(`maxChoices must be an integer between 1 and ${Math.min(optionCount, VOTE_MAX_CHOICES_LIMIT)}`, "maxChoices");
        }
        // 允许选完全部选项时等价于不限数量
        if (maxChoices === optionCount) {
            return { multiple: true, maxChoices: optionCount };
        }
        return { multiple: true, maxChoices };
    }

    /**
     * 校验并对齐投票起止时间
     * @param {Object} params - 参数对象
     * @param {number} [params.startedAt] - 开始时间戳
     * @param {number} [params.endedAt] - 截止时间戳
     * @returns {{startedAt:number,endedAt:number}} 起止时间
     */
    static #parseDuration({ startedAt, endedAt }) {
        const now = Date.now();
        const safeStartedAt = startedAt === undefined || startedAt === null ? now : startedAt;
        if (!Number.isInteger(safeStartedAt)) {
            throw new ValidationError("Invalid startedAt", "startedAt");
        }
        const safeEndedAt = endedAt === undefined || endedAt === null ? safeStartedAt + VOTE_DEFAULT_DURATION : endedAt;
        if (!Number.isInteger(safeEndedAt)) {
            throw new ValidationError("Invalid endedAt", "endedAt");
        }
        const duration = safeEndedAt - safeStartedAt;
        if (duration < VOTE_MIN_DURATION) {
            throw new ValidationError(`投票时长至少为${Math.round(VOTE_MIN_DURATION / 60000)}分钟`, "endedAt");
        }
        if (duration > VOTE_MAX_DURATION) {
            throw new ValidationError(`投票时长最多为${Math.round(VOTE_MAX_DURATION / 86400000)}天`, "endedAt");
        }
        if (safeEndedAt <= now) {
            throw new ValidationError("投票截止时间必须晚于当前时间", "endedAt");
        }
        return { startedAt: safeStartedAt, endedAt: safeEndedAt };
    }

    /**
     * 判断请求方是否是该任务的发起人
     * @param {Object} task - task_config 记录
     * @param {Object} viewer - 请求方信息
     * @returns {boolean} 是否为发起人
     */
    static isCreator(task, viewer) {
        if (!task || !viewer) return false;
        return task.source === viewer.id || task.source === viewer.userType;
    }

    /**
     * 校验请求方是否有权管理该任务
     * @param {Object} task - task_config 记录
     * @param {Object} viewer - 请求方信息
     */
    static assertCreator(task, viewer) {
        if (!TaskVoteService.isCreator(task, viewer)) {
            throw new ForbiddenError("只有投票发起人可以执行该操作");
        }
    }

    /**
     * 获取投票任务记录, 不存在或类型不符时抛错
     * @param {number} taskId - 任务 ID
     * @returns {Object} task_config 记录
     */
    static #requireVoteTask(taskId) {
        if (!Number.isInteger(taskId)) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const task = TaskConfigModel.getTaskById(taskId);
        if (!task) {
            throw new NotFoundError(`Task not found: ${taskId}`);
        }
        if (task.task_type !== TaskType.vote) {
            throw new ValidationError(`Task ${taskId} is not a vote task`, "taskId");
        }
        const vote = TaskVoteModel.getVoteByTaskId(taskId);
        if (!vote) {
            throw new NotFoundError(`Vote config not found: ${taskId}`);
        }
        return { task, vote };
    }

    /**
     * 解析投票记录中保存的参与人列表
     * @param {string} voters - JSON 字符串
     * @returns {Array<string>} 参与人 ID 列表
     */
    static #parseVoterIds(voters) {
        if (!voters) return [];
        try {
            const result = JSON.parse(voters);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            logger.warn("投票参与人列表解析失败", error);
            return [];
        }
    }

    /**
     * 创建投票任务
     * @param {Object} params - 参数对象
     * @param {string} params.title - 投票标题
     * @param {Array<string>} params.options - 选项内容列表
     * @param {Array<string>} params.voters - 参与投票的用户 ID 列表
     * @param {boolean} [params.multiple] - 是否多选
     * @param {number} [params.maxChoices] - 多选时的最多可选数量
     * @param {boolean} [params.anonymous] - 是否匿名投票
     * @param {number} [params.startedAt] - 开始时间戳
     * @param {number} [params.endedAt] - 截止时间戳
     * @param {string} params.source - 发起人 ID
     * @returns {Object} 创建结果
     */
    static createVoteTask({ title, options, voters, multiple, maxChoices, anonymous, startedAt, endedAt, source }) {
        const safeTitle = TaskVoteService.#parseTitle(title);
        const safeOptions = TaskVoteService.#parseOptions(options);
        const safeVoters = TaskVoteService.#parseVoters(voters);
        const choice = TaskVoteService.#parseChoice({ multiple, maxChoices, optionCount: safeOptions.length });
        const { startedAt: safeStartedAt, endedAt: safeEndedAt } = TaskVoteService.#parseDuration({ startedAt, endedAt });
        if (typeof source !== "string" || source.length === 0 || source.length > 64) {
            throw new ValidationError("Invalid source", "source");
        }
        if (anonymous !== undefined && typeof anonymous !== "boolean") {
            throw new ValidationError("Invalid anonymous", "anonymous");
        }

        const create = db.transaction(() => {
            const result = TaskConfigModel.createTask({
                title: safeTitle,
                started_at: safeStartedAt,
                ended_at: safeEndedAt,
                task_type: TaskType.vote,
                source,
                is_notice: 0
            });
            const taskId = Number(result.lastInsertRowid);
            TaskVoteModel.createVote({
                task_id: taskId,
                voters: safeVoters,
                multiple: choice.multiple,
                max_choices: choice.maxChoices,
                anonymous: anonymous === true
            });
            safeOptions.forEach((content, index) => {
                TaskVoteModel.createOption({ task_id: taskId, content, position: index });
            });
            return taskId;
        });
        const taskId = create();
        logger.info(`创建投票任务${taskId}`, { source, voterCount: safeVoters.length, optionCount: safeOptions.length });
        return {
            taskId,
            title: safeTitle,
            voters: safeVoters,
            startedAt: safeStartedAt,
            endedAt: safeEndedAt,
            anonymous: anonymous === true
        };
    }

    /**
     * 获取投票任务详情(按请求方身份裁剪可见字段)
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {Object} params.viewer - 请求方信息
     * @param {string} params.viewer.id - 请求方用户 ID
     * @param {string} [params.viewer.userType] - 请求方用户类型
     * @returns {Object} 投票任务详情
     */
    static getVoteTask({ taskId, viewer }) {
        const { task, vote } = TaskVoteService.#requireVoteTask(taskId);
        const voterIds = TaskVoteService.#parseVoterIds(vote.voters);
        const options = TaskVoteModel.getOptionsByTaskId(taskId);
        const records = TaskVoteModel.getRecordsByTaskId(taskId);

        const isCreator = TaskVoteService.isCreator(task, viewer);
        const isVoter = viewer?.id !== undefined && voterIds.includes(viewer.id);
        const myRecords = viewer?.id === undefined
            ? []
            : records.filter(record => record.voter_id === viewer.id);
        const myOptionIds = myRecords.map(record => record.option_id);
        const votedIdList = [...new Set(records.map(record => record.voter_id))];
        const now = Date.now();
        const ended = task.ended_at <= now;
        const started = task.started_at <= now;
        // 未投票的参与者看不到票数, 避免从众效应; 发起人与已结束的投票始终可见
        const resultVisible = isCreator || ended || myOptionIds.length > 0;

        const countMap = new Map(TaskVoteModel.countByOption(taskId).map(row => [row.option_id, row.count]));
        const recordVoterMap = new Map();
        const votedAtMap = new Map();
        for (const record of records) {
            if (!recordVoterMap.has(record.option_id)) recordVoterMap.set(record.option_id, []);
            recordVoterMap.get(record.option_id).push(record.voter_id);
            const lastVotedAt = votedAtMap.get(record.voter_id) ?? 0;
            if (record.voted_at > lastVotedAt) votedAtMap.set(record.voter_id, record.voted_at);
        }

        const usernameMap = TaskVoteService.#getUsernameMap();
        return {
            taskId: task.task_id,
            taskType: TaskType.vote,
            title: task.title,
            startedAt: task.started_at,
            endedAt: task.ended_at,
            createdAt: task.started_at,
            source: task.source,
            creatorName: usernameMap.get(task.source) ?? task.source,
            isCreator,
            isVoter,
            multiple: vote.multiple === 1,
            maxChoices: Number.isInteger(vote.max_choices) ? vote.max_choices : (vote.multiple === 1 ? options.length : 1),
            anonymous: vote.anonymous === 1,
            started,
            ended,
            resultVisible,
            participantCount: voterIds.length,
            votedCount: votedIdList.length,
            myOptionIds,
            options: options.map(option => ({
                optionId: option.option_id,
                content: option.content,
                position: option.position,
                count: resultVisible ? (countMap.get(option.option_id) ?? 0) : null,
                // 匿名投票不返回具体投票人, 保护投票隐私
                voterIdList: resultVisible && vote.anonymous !== 1
                    ? (recordVoterMap.get(option.option_id) ?? [])
                    : null
            })),
            // 参与进度明细只对发起人开放, 避免暴露过多名单信息
            voterList: isCreator ? voterIds.map(voterId => ({
                id: voterId,
                username: usernameMap.get(voterId) ?? "未知用户",
                voted: votedIdList.includes(voterId),
                votedAt: votedAtMap.get(voterId) ?? null
            })) : null
        };
    }

    /**
     * 获取投票任务详情, 任务不存在或类型不符时返回 null
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {Object} params.viewer - 请求方信息
     * @returns {Object|null} 投票任务详情
     */
    static safeGetVoteTask({ taskId, viewer } = {}) {
        try {
            return TaskVoteService.getVoteTask({ taskId, viewer });
        } catch (error) {
            return null;
        }
    }

    /**
     * 获取与请求方相关的投票列表(我参与的 + 我发起的)
     * @param {Object} params - 参数对象
     * @param {Object} params.viewer - 请求方信息
     * @param {string} params.viewer.id - 请求方用户 ID
     * @param {string} [params.viewer.userType] - 请求方用户类型
     * @returns {{participated:Array,created:Array}} 投票列表
     */
    static getMyVoteList({ viewer }) {
        const rows = TaskVoteModel.getAllVotes().slice(0, VOTE_LIST_MAX_LENGTH);
        const participated = [];
        const created = [];
        const now = Date.now();
        const usernameMap = TaskVoteService.#getUsernameMap();
        for (const row of rows) {
            const voterIds = TaskVoteService.#parseVoterIds(row.voters);
            const isCreator = TaskVoteService.isCreator(row, viewer);
            const isVoter = viewer?.id !== undefined && voterIds.includes(viewer.id);
            if (!isCreator && !isVoter) continue;
            const item = {
                taskId: row.task_id,
                title: row.title,
                taskType: TaskType.vote,
                createdAt: row.started_at,
                startedAt: row.started_at,
                endedAt: row.ended_at,
                source: row.source,
                creatorName: usernameMap.get(row.source) ?? row.source,
                isCreator,
                anonymous: row.anonymous === 1,
                multiple: row.multiple === 1,
                participantCount: voterIds.length,
                votedCount: TaskVoteModel.getVotedIdList(row.task_id).length,
                voted: isVoter ? TaskVoteModel.hasVoted(row.task_id, viewer.id) : false,
                ended: row.ended_at <= now
            };
            if (isCreator) created.push(item);
            if (isVoter) participated.push(item);
        }
        return { participated, created };
    }

    /**
     * 提交投票(重复提交会覆盖该用户上一次的选择)
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {string} params.voterId - 投票人 ID
     * @param {Array<number>} params.optionIds - 选中的选项 ID 列表
     * @returns {{taskId:number,votedCount:number,participantCount:number,voterId:string,source:string,title:string}} 提交结果
     */
    static submitVote({ taskId, voterId, optionIds }) {
        const { task, vote } = TaskVoteService.#requireVoteTask(taskId);
        if (!isUnsignedIntegerString(voterId)) {
            throw new ValidationError("Invalid voter id", "voterId");
        }
        const voterIds = TaskVoteService.#parseVoterIds(vote.voters);
        if (!voterIds.includes(voterId)) {
            throw new ForbiddenError("你不在本次投票的参与人名单中");
        }
        const now = Date.now();
        if (task.started_at > now) {
            throw new ConflictError("投票尚未开始", "taskId");
        }
        if (task.ended_at <= now) {
            throw new ConflictError("投票已结束", "taskId");
        }
        if (!Array.isArray(optionIds) || optionIds.length === 0) {
            throw new ValidationError("optionIds must not be empty", "optionIds");
        }
        const options = TaskVoteModel.getOptionsByTaskId(taskId);
        const validIdSet = new Set(options.map(option => option.option_id));
        const selectedIdList = [...new Set(optionIds)];
        for (const optionId of selectedIdList) {
            if (!Number.isInteger(optionId)) {
                throw new ValidationError(`Invalid option id: ${optionId}`, "optionIds");
            }
            if (!validIdSet.has(optionId)) {
                throw new ValidationError(`Option ${optionId} does not belong to task ${taskId}`, "optionIds");
            }
        }
        const multiple = vote.multiple === 1;
        const maxChoices = Number.isInteger(vote.max_choices) ? vote.max_choices : options.length;
        if (!multiple && selectedIdList.length !== 1) {
            throw new ValidationError("本次投票为单选, 只能选择一个选项", "optionIds");
        }
        if (multiple && selectedIdList.length > maxChoices) {
            throw new ValidationError(`本次投票最多选择${maxChoices}个选项`, "optionIds");
        }

        TaskVoteModel.replaceVoterRecords({
            task_id: taskId,
            voter_id: voterId,
            option_ids: selectedIdList,
            voted_at: now
        });
        const votedCount = TaskVoteModel.getVotedIdList(taskId).length;
        logger.info(`用户${voterId}完成投票${taskId}`, { optionIds: selectedIdList });
        return {
            taskId,
            voterId,
            source: task.source,
            title: task.title,
            votedCount,
            participantCount: voterIds.length
        };
    }

    /**
     * 修改投票任务
     * @param {Object} params - 参数对象
     * @param {number} params.taskId - 任务 ID
     * @param {Object} params.taskData - 待更新字段
     * @param {string} [params.taskData.title] - 投票标题
     * @param {Array<string>} [params.taskData.options] - 选项内容列表
     * @param {Array<string>} [params.taskData.voters] - 参与人 ID 列表
     * @param {boolean} [params.taskData.multiple] - 是否多选
     * @param {number} [params.taskData.maxChoices] - 最多可选数量
     * @param {boolean} [params.taskData.anonymous] - 是否匿名
     * @param {number} [params.taskData.endedAt] - 截止时间戳
     * @param {Object} params.viewer - 请求方信息
     * @returns {Object} 更新后的投票详情
     */
    static updateVoteTask({ taskId, taskData = {}, viewer }) {
        const { task, vote } = TaskVoteService.#requireVoteTask(taskId);
        TaskVoteService.assertCreator(task, viewer);

        const hasVotedRecords = TaskVoteModel.getVotedIdList(taskId).length > 0;
        const safeTitle = taskData.title === undefined ? undefined : TaskVoteService.#parseTitle(taskData.title);
        const safeVoters = taskData.voters === undefined ? undefined : TaskVoteService.#parseVoters(taskData.voters);
        if (taskData.anonymous !== undefined && typeof taskData.anonymous !== "boolean") {
            throw new ValidationError("Invalid anonymous", "anonymous");
        }

        let safeOptions;
        if (taskData.options !== undefined) {
            if (hasVotedRecords) {
                throw new ConflictError("已有成员完成投票, 不能再修改选项", "options");
            }
            safeOptions = TaskVoteService.#parseOptions(taskData.options);
        }

        let choice;
        if (taskData.multiple !== undefined || taskData.maxChoices !== undefined) {
            if (hasVotedRecords) {
                throw new ConflictError("已有成员完成投票, 不能再修改选择方式", "multiple");
            }
            const optionCount = safeOptions?.length ?? TaskVoteModel.getOptionsByTaskId(taskId).length;
            choice = TaskVoteService.#parseChoice({
                multiple: taskData.multiple ?? vote.multiple === 1,
                maxChoices: taskData.maxChoices,
                optionCount
            });
        }

        let safeEndedAt;
        if (taskData.endedAt !== undefined) {
            if (!Number.isInteger(taskData.endedAt)) {
                throw new ValidationError("Invalid endedAt", "endedAt");
            }
            if (taskData.endedAt > task.started_at + VOTE_MAX_DURATION) {
                throw new ValidationError(`投票时长最多为${Math.round(VOTE_MAX_DURATION / 86400000)}天`, "endedAt");
            }
            // 允许提前结束投票, 但不允许把结束时间改到开始之前
            if (taskData.endedAt <= task.started_at) {
                throw new ValidationError("截止时间必须晚于开始时间", "endedAt");
            }
            safeEndedAt = taskData.endedAt;
        }

        const update = db.transaction(() => {
            if (safeTitle !== undefined || safeEndedAt !== undefined) {
                TaskConfigModel.updateTask(taskId, {
                    title: safeTitle,
                    ended_at: safeEndedAt
                });
            }
            if (safeVoters !== undefined || choice !== undefined || taskData.anonymous !== undefined) {
                TaskVoteModel.updateVote(taskId, {
                    voters: safeVoters,
                    multiple: choice?.multiple,
                    max_choices: choice === undefined ? undefined : choice.maxChoices,
                    anonymous: taskData.anonymous
                });
            }
            if (safeOptions !== undefined) {
                TaskVoteModel.deleteOptionsByTaskId(taskId);
                safeOptions.forEach((content, index) => {
                    TaskVoteModel.createOption({ task_id: taskId, content, position: index });
                });
            }
        });
        update();
        return TaskVoteService.getVoteTask({ taskId, viewer });
    }

    /**
     * 获取全部用户的 ID 到用户名映射
     * @private
     * @returns {Map<string,string>} 用户 ID 到用户名的映射
     */
    static #getUsernameMap() {
        return new Map(GroupModel.getEntireGroup().map(user => [user.id, user.username]));
    }
}

module.exports = TaskVoteService;
