const { ValidationError, NotFoundError, ConflictError } = require("../error");
const logger = require("../logger");
const AuthModel = require("../models/auth.model");
const UserLikeModel = require("../models/user_like.model");
const { isUnsignedIntegerString } = require("../utils/validation");

class UserLikeService {

    /**
     * 计算点赞日期(按服务器本地时间), 每天零点自然重置
     * @param {Date} [date] - 时间
     * @returns {string} YYYY-MM-DD
     */
    static getDayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * 给某个用户点赞, 每人每天对同一个用户只能点一次
     * @param {Object} params - 参数对象
     * @param {string} params.likerId - 点赞人 ID
     * @param {string} params.targetId - 被点赞人 ID
     * @returns {{targetId:string,likeCount:number,alreadyLiked:boolean}} 点赞结果
     */
    static likeUser({ likerId, targetId }) {
        if (!isUnsignedIntegerString(likerId)) {
            throw new ValidationError("Invalid liker id", "likerId");
        }
        if (!isUnsignedIntegerString(targetId)) {
            throw new ValidationError("Invalid target id", "targetId");
        }
        if (likerId === targetId) {
            throw new ConflictError("不能给自己点赞", "targetId");
        }
        if (!AuthModel.findUser(targetId)) {
            throw new NotFoundError(`User not found: ${targetId}`);
        }

        const likeDay = UserLikeService.getDayKey();
        const result = UserLikeModel.createLike({
            liker_id: likerId,
            target_id: targetId,
            like_day: likeDay,
            created_at: Date.now()
        });
        const alreadyLiked = result.changes === 0;
        if (!alreadyLiked) {
            logger.info(`${likerId}给${targetId}点赞`, { day: likeDay });
        }
        return {
            targetId,
            // 无论是否是重复点击, 都返回最新的获赞总数
            likeCount: UserLikeModel.getLikeCount(targetId),
            alreadyLiked
        };
    }

    /**
     * 撤回今天给出的赞
     * @param {Object} params - 参数对象
     * @param {string} params.likerId - 点赞人 ID
     * @param {string} params.targetId - 被点赞人 ID
     * @returns {{targetId:string,likeCount:number,canceled:boolean}} 撤回结果
     */
    static cancelLike({ likerId, targetId }) {
        if (!isUnsignedIntegerString(likerId)) {
            throw new ValidationError("Invalid liker id", "likerId");
        }
        if (!isUnsignedIntegerString(targetId)) {
            throw new ValidationError("Invalid target id", "targetId");
        }
        const likeDay = UserLikeService.getDayKey();
        const result = UserLikeModel.deleteLike({
            liker_id: likerId,
            target_id: targetId,
            like_day: likeDay
        });
        return {
            targetId,
            likeCount: UserLikeModel.getLikeCount(targetId),
            canceled: result.changes > 0
        };
    }

    /**
     * 查询某个人收到的赞
     * @param {Object} params - 参数对象
     * @param {string} params.viewerId - 当前请求方 ID
     * @param {string} params.targetId - 被查询人 ID
     * @returns {{targetId:string,likeCount:number,likedToday:boolean}} 点赞信息
     */
    static getLikeInfo({ viewerId, targetId }) {
        if (!isUnsignedIntegerString(targetId)) {
            throw new ValidationError("Invalid target id", "targetId");
        }
        const likeDay = UserLikeService.getDayKey();
        return {
            targetId,
            likeCount: UserLikeModel.getLikeCount(targetId),
            likedToday: isUnsignedIntegerString(viewerId)
                && UserLikeModel.hasLiked({ liker_id: viewerId, target_id: targetId, like_day: likeDay })
        };
    }

    /**
     * 查询所有人都获赞数与"我今天赞过谁", 供用户列表直接展示
     * @param {Object} params - 参数对象
     * @param {string} params.viewerId - 当前请求方 ID
     * @returns {{countMap:Map<string,number>,likedIdSet:Set<string>}} 点赞信息
     */
    static getLikeOverview({ viewerId }) {
        const likeDay = UserLikeService.getDayKey();
        return {
            countMap: UserLikeModel.getLikeCountMap(),
            likedIdSet: new Set(
                isUnsignedIntegerString(viewerId)
                    ? UserLikeModel.getLikedTargetIdList({ liker_id: viewerId, like_day: likeDay })
                    : []
            )
        };
    }

    /**
     * 查询某人今天已经赞了多少人
     * @param {Object} params - 参数对象
     * @param {string} params.likerId - 点赞人 ID
     * @returns {{likedCount:number,day:string}} 点赞情况
     */
    static getMyLikeSummary({ likerId }) {
        const likeDay = UserLikeService.getDayKey();
        if (!isUnsignedIntegerString(likerId)) {
            throw new ValidationError("Invalid liker id", "likerId");
        }
        return {
            day: likeDay,
            likedCount: UserLikeModel.getLikedCountByDay({ liker_id: likerId, like_day: likeDay })
        };
    }
}

module.exports = UserLikeService;
