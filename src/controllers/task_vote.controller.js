const AuthService = require("../service/auth.service");
const TaskVoteService = require("../service/task_vote.service");
const WebSocketController = require("./ws.controller");
const { ValidationError } = require("../error");
const { toPositiveInteger, isUnsignedIntegerString } = require("../utils/validation");
const { WS_MESSAGE_VOTE, WS_MESSAGE_VOTE_UPDATE } = require("../config/task");
const logger = require("../logger");

class TaskVoteController {
    /**
     * 创建投票任务, 并向所有参与人推送投票通知
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static createVote(req, res) {
        const { id } = req.accessPayload;
        const { title, options, voters, multiple, maxChoices, anonymous, startedAt, endedAt } = req.body;
        const result = TaskVoteService.createVoteTask({
            title,
            options,
            voters,
            multiple,
            maxChoices,
            anonymous,
            startedAt,
            endedAt,
            source: id
        });
        // 发起人不需要收到自己发起的投票通知
        const pushTargetList = result.voters.filter((voterId) => voterId !== id);
        const pushed = WebSocketController.pushMessage(pushTargetList, {
            type: WS_MESSAGE_VOTE,
            taskId: result.taskId,
            title: result.title,
            endedAt: result.endedAt,
            anonymous: result.anonymous,
            ts: Date.now(),
            source: JSON.stringify({ id, username: AuthService.getUsernameById(id) })
        });
        logger.info(`投票${result.taskId}推送给${pushed.onlineCount}个在线用户,${pushed.offlineCount}个离线用户`);
        return res.status(201).json({
            taskId: result.taskId,
            onlineCount: pushed.onlineCount,
            offlineCount: pushed.offlineCount
        });
    }

    /**
     * 获取投票任务详情
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getVote(req, res) {
        const taskId = toPositiveInteger(req.params.taskId);
        if (taskId === null) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const vote = TaskVoteService.getVoteTask({ taskId, viewer: req.accessPayload });
        return res.json(vote);
    }

    /**
     * 获取与当前用户相关的投票列表
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getMyVotes(req, res) {
        const result = TaskVoteService.getMyVoteList({ viewer: req.accessPayload });
        return res.json(result);
    }

    /**
     * 提交投票, 并把最新的参与进度推送给发起人
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static submitVote(req, res) {
        const { id } = req.accessPayload;
        const taskId = toPositiveInteger(req.body.taskId);
        if (taskId === null) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const { optionIds } = req.body;
        if (!Array.isArray(optionIds)) {
            throw new ValidationError("optionIds must be an array", "optionIds");
        }
        const result = TaskVoteService.submitVote({
            taskId,
            voterId: id,
            optionIds: optionIds.map((optionId) => toPositiveInteger(optionId))
        });
        // 发起人可能不在参与人名单中, 这里单独推送投票进度
        if (isUnsignedIntegerString(result.source) && result.source !== id) {
            WebSocketController.pushMessage([result.source], {
                type: WS_MESSAGE_VOTE_UPDATE,
                taskId: result.taskId,
                title: result.title,
                votedCount: result.votedCount,
                participantCount: result.participantCount,
                ts: Date.now()
            });
        }
        return res.status(201).json({
            taskId: result.taskId,
            votedCount: result.votedCount,
            participantCount: result.participantCount
        });
    }

    /**
     * 修改投票任务, 并通知参与人刷新
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static updateVote(req, res) {
        const taskId = toPositiveInteger(req.body.taskId);
        if (taskId === null) {
            throw new ValidationError("Invalid task id", "taskId");
        }
        const { taskData } = req.body;
        const vote = TaskVoteService.updateVoteTask({
            taskId,
            taskData,
            viewer: req.accessPayload
        });
        WebSocketController.pushMessage(vote.voterList?.map((voter) => voter.id) ?? [], {
            type: WS_MESSAGE_VOTE_UPDATE,
            taskId,
            title: vote.title,
            votedCount: vote.votedCount,
            participantCount: vote.participantCount,
            changed: true,
            ts: Date.now()
        });
        return res.json(vote);
    }
}

module.exports = TaskVoteController;
