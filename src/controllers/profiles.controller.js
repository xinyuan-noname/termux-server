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
}
module.exports = ProfilesController;