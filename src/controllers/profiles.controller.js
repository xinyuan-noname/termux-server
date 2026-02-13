const { FileUploadError } = require("../error");
const ProfilesServer = require("../service/profiles.service");
const { enqueueAvatarDelete } = require("../utils/queue");

class ProfilesController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static uploadAvatar(req, res) {
        const { access, file } = req;
        if (!file) {
            new FileUploadError();
        }
        const { id } = access;
        const oldAvatarPath = ProfilesServer.getAvatarName({ id });
        if (oldAvatarPath) {
            enqueueAvatarDelete(oldAvatarPath);
        }
        ProfilesServer.uploadAvatar({ id, avatarName: file.filename });
        return res.status(204).end();
    }
}
module.exports = ProfilesController;