const db = require("../database/db");

class UserLikeModel {

    /**
     * 记录一次点赞, 同一天重复点赞会被 UNIQUE 约束挡下
     * @param {Object} likeData - 点赞数据
     * @param {string} likeData.liker_id - 点赞人 ID
     * @param {string} likeData.target_id - 被点赞人 ID
     * @param {string} likeData.like_day - 点赞日期(YYYY-MM-DD)
     * @param {number} likeData.created_at - 点赞时间戳
     * @returns {Object} 写入结果, changes 为 0 表示今天已经赞过
     */
    static createLike({ liker_id, target_id, like_day, created_at }) {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO user_like (liker_id, target_id, like_day, created_at)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(liker_id, target_id, like_day, created_at);
    }

    /**
     * 查询某个用户收到的总赞数
     * @param {string} target_id - 被点赞人 ID
     * @returns {number} 获赞数
     */
    static getLikeCount(target_id) {
        const stmt = db.prepare("SELECT COUNT(*) AS count FROM user_like WHERE target_id = ?");
        return stmt.get(target_id)?.count ?? 0;
    }

    /**
     * 统计所有人的获赞数
     * @returns {Map<string, number>} 用户 ID 到获赞数的映射
     */
    static getLikeCountMap() {
        const stmt = db.prepare("SELECT target_id, COUNT(*) AS count FROM user_like GROUP BY target_id");
        return new Map(stmt.all().map(row => [row.target_id, row.count]));
    }

    /**
     * 查询某人在某天赞过哪些人
     * @param {Object} params - 参数对象
     * @param {string} params.liker_id - 点赞人 ID
     * @param {string} params.like_day - 点赞日期(YYYY-MM-DD)
     * @returns {Array<string>} 被点赞人 ID 列表
     */
    static getLikedTargetIdList({ liker_id, like_day }) {
        const stmt = db.prepare("SELECT target_id FROM user_like WHERE liker_id = ? AND like_day = ?");
        return stmt.all(liker_id, like_day).map(row => row.target_id);
    }

    /**
     * 判断某人今天是否赞过某个用户
     * @param {Object} params - 参数对象
     * @param {string} params.liker_id - 点赞人 ID
     * @param {string} params.target_id - 被点赞人 ID
     * @param {string} params.like_day - 点赞日期(YYYY-MM-DD)
     * @returns {boolean} 是否已点赞
     */
    static hasLiked({ liker_id, target_id, like_day }) {
        const stmt = db.prepare(`
            SELECT 1 FROM user_like
            WHERE liker_id = ? AND target_id = ? AND like_day = ?
            LIMIT 1
        `);
        return stmt.get(liker_id, target_id, like_day) !== undefined;
    }

    /**
     * 查询某人在某天总共赞了多少人
     * @param {Object} params - 参数对象
     * @param {string} params.liker_id - 点赞人 ID
     * @param {string} params.like_day - 点赞日期(YYYY-MM-DD)
     * @returns {number} 点赞人数
     */
    static getLikedCountByDay({ liker_id, like_day }) {
        const stmt = db.prepare("SELECT COUNT(*) AS count FROM user_like WHERE liker_id = ? AND like_day = ?");
        return stmt.get(liker_id, like_day)?.count ?? 0;
    }

    /**
     * 清空某条点赞记录(用于撤回)
     * @param {Object} params - 参数对象
     * @param {string} params.liker_id - 点赞人 ID
     * @param {string} params.target_id - 被点赞人 ID
     * @param {string} params.like_day - 点赞日期(YYYY-MM-DD)
     * @returns {Object} 删除结果
     */
    static deleteLike({ liker_id, target_id, like_day }) {
        const stmt = db.prepare("DELETE FROM user_like WHERE liker_id = ? AND target_id = ? AND like_day = ?");
        return stmt.run(liker_id, target_id, like_day);
    }
}

module.exports = UserLikeModel;
