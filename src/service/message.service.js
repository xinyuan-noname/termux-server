const { PENDING_REMIND_KEY, SENT_REMIND_KEY } = require("../config/ws");
const redis = require("../redis");

class MessageServer {
    static async cacheRemind({ data, userId, sent = false } = {}) {
        const key = sent ? SENT_REMIND_KEY.replace('{userId}', userId) : PENDING_REMIND_KEY.replace('{userId}', userId);
        await redis.lPush(key, data);
        await redis.lTrim(key, 0, 49);
        await redis.expire(key, 3 * 24 * 3600);
    }
    static async getRemindSent({ userId, ts, limit = 100 } = {}) {
        if (limit <= 0) return [];
        const result = [];
        const key = SENT_REMIND_KEY.replace('{userId}', userId);
        const list = await redis.lRange(key, 0, limit - 1);
        for (const item of list) {
            const json = JSON.parse(item);
            if (json.ts < ts) break;
            result.push(json);
        }
        return result;
    }
}
module.exports = MessageServer;