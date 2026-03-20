const { NotFoundError } = require("../error");
const ProfilesServer = require("../service/profiles.service");

class AssetController{
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
        res.setHeader('Cache-Control', 'public, max-age=43200');
        return res.sendFile(avatarPath, err => {
            if (err && !res.headersSent) {
                return res.status(500).end();
            }
        })
    }
}
module.exports = AssetController;