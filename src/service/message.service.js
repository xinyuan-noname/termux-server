
const { SENT_REMIND_KEY, PENDING_REMIND_KEY, PUBLIC_TO_DO_LIST_KEY } = require("../config/message_config");
const redis = require("../redis");

class MessageServer {
    static async cacheRemind({ data, userId, sent = false }) {
        const key = sent ? SENT_REMIND_KEY.replace('{userId}', userId) : PENDING_REMIND_KEY.replace('{userId}', userId);
        await redis.rPush(key, data);
        await redis.lTrim(key, 0, 49);
        await redis.expire(key, 3 * 24 * 3600);
    }
    static async getRemindSent({ userId, ts, limit = 100 }) {
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
    static async getRemindPending({ userId }) {
        const key = PENDING_REMIND_KEY.replace('{userId}', userId);
        const result = [];
        while (true) {
            const msg = await redis.lPop(key);
            if (msg === null) break;
            result.push(JSON.parse(msg));
            MessageServer.cacheRemind({ data: msg, userId, sent: true });
        }
        return result;
    }
    static async getPublicToDoItem({ itemId }) {
        const key = PUBLIC_TO_DO_LIST_KEY;
        const result = await redis.hGet(key, itemId);
        return JSON.parse(result);
    }
    static async setPublicToDoItem({ itemId, title, content, source, ts }) {
        const key = PUBLIC_TO_DO_LIST_KEY;
        await redis.hSet(key, itemId, JSON.stringify({ title, content, source, ts }));
    }
    static async deletePublicToDoItem({ itemId }) {
        const key = PUBLIC_TO_DO_LIST_KEY;
        await redis.hDel(key, itemId);
    }
    static async getPublicToDoList() {
        const key = PUBLIC_TO_DO_LIST_KEY;
        const list = Object
            .entries(await redis.hGetAll(key))
            .map(([key, val]) => {
                return {
                    itemId: key,
                    ...JSON.parse(val)
                }
            })
            .sort((a, b) => b.ts - a.ts);
        return list;
    }
}
module.exports = MessageServer;