const { FileUploadError, NotFoundError } = require("../error");
const ProfilesServer = require("../service/profiles.service");
const { safeGetAvatarPath } = require("../utils/profiles");
const { enqueueAvatarDelete } = require("../utils/queue");

class ProfilesController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static uploadAvatar(req, res) {
        const { accessPayload, file } = req;
        if (!file) {
            throw new FileUploadError();
        }
        const { id } = accessPayload;
        const oldAvatarName = ProfilesServer.getAvatarName({ id });
        if (oldAvatarName) {
            enqueueAvatarDelete(oldAvatarName);
        }
        ProfilesServer.uploadAvatar({ id, avatarName: file.filename });
        return res.status(204).end();
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getAvatar(req, res) {
        const params = req.params;
        if (!params.id) {
            throw new NotFoundError("未指定头像id");
        }
        const id = params.id
        const avatarName = ProfilesServer.getAvatarName({ id });
        const avatarPath = safeGetAvatarPath(avatarName);
        if (avatarPath == null) {
            throw new NotFoundError(`未找到${id}头像`);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(avatarPath, err => {
            if (err && !res.headersSent) {
                return res.status(500).end();
            }
        })
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getUserInfoBatch(req, res) {
        const { idList, config } = req.body;
        const result = ProfilesServer.getUserInfoBatch({ idList, config });
        return res.json(result);
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getUserInfo(req, res) {
        const { id } = req.params;
        const config = req.query;
        const result = ProfilesServer.getUserInfo({ id, config });
        return res.json(result);
    }
}
module.exports = ProfilesController;