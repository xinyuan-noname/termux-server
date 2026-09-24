const UserLikeService = require("../service/user_like.service");

class UserLikeController {
    /**
     * 给某个用户点赞
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static likeUser(req, res) {
        const { id } = req.accessPayload;
        const { targetId } = req.body;
        const result = UserLikeService.likeUser({ likerId: id, targetId });
        return res.status(201).json(result);
    }

    /**
     * 撤回今天给出的赞
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static cancelLike(req, res) {
        const { id } = req.accessPayload;
        const { targetId } = req.body;
        const result = UserLikeService.cancelLike({ likerId: id, targetId });
        return res.json(result);
    }

    /**
     * 查询某个用户收到的赞
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getLikeInfo(req, res) {
        const { id } = req.accessPayload;
        const { id: targetId } = req.params;
        const result = UserLikeService.getLikeInfo({ viewerId: id, targetId });
        return res.json(result);
    }

    /**
     * 查询我今天赞了多少人
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getMyLikeSummary(req, res) {
        const { id } = req.accessPayload;
        const result = UserLikeService.getMyLikeSummary({ likerId: id });
        return res.json(result);
    }
}

module.exports = UserLikeController;
