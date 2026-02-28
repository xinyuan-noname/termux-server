const { FileUploadError, NotFoundError } = require("../error");
const ProfilesServer = require("../service/profiles.service");
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
        const avatarPath = ProfilesServer.getAvatarPath({ id });
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
        const payload = req.accessPayload;
        const { idList, config } = req.body;
        if (config.passwordRequired && payload.userType !== "admin") config.passwordRequired = false;
        const result = ProfilesServer.getUserInfoBatch({ idList, config });
        return res.json(result);
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getUserInfo(req, res) {
        const payload = req.accessPayload;
        const { id } = req.params;
        const { config } = req.body;
        if (config.passwordRequired && payload.userType !== "admin") config.passwordRequired = false;
        const result = ProfilesServer.getUserInfo({ id, config });
        return res.json(result);
    }
    /**
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   * @returns 
   */
    static myProfile(req, res) {
        const payload = req.accessPayload;
        const { id } = payload;
        const config = { username: true, gender: true, userType: true, passwordRequired: true };
        const result = ProfilesServer.getUserInfo({ id, config });
        return res.json(result);
    }
    /**
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   * @returns 
   */
    static myAvatar(req, res) {
        const payload = req.accessPayload;
        const { id } = payload;
        const avatarPath = ProfilesServer.getAvatarPath({ id });
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(avatarPath, err => {
            if (err && !res.headersSent) {
                return res.status(500).end();
            }
        })
    }
}
module.exports = ProfilesController;