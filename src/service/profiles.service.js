const { ValidationError } = require("../error");
const ProfilesModel = require("../models/profiles.model");
const { checkAvatarExist } = require("../utils/profiles");
const { isUnsignedIntegerString } = require("../utils/validation");

class ProfilesServer {
    static uploadAvatar({ id, avatarName } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("Invalid user ID", "id");
        }
        if (typeof avatarName !== "string") {
            throw new ValidationError("Invalid avatar");
        }
        if (checkAvatarExist(avatarName)) {
            ProfilesModel.updateAvatarName(id, avatarName);
            return {};
        } else {
            throw new Error("上传头像失败");
        }
    }
    static getAvatarName({ id } = {}) {
        const user = ProfilesModel.getAvatarName(id);
        return user.avatar_name;
    }
}
module.exports = ProfilesServer;