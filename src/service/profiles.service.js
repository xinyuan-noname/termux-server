const { ValidationError } = require("../error");
const ProfilesModel = require("../models/profiles.model");
const { checkAvatarExist } = require("../utils/profiles");
const { isUnsignedIntegerString } = require("../utils/validation");

const genUserInfoResult = (config, userInfo) => {
    const result = { id: config.id };
    if (config.gender === true) {
        result.gender = userInfo.gender;
    }
    if (config.userType === true) {
        result.userType = userInfo.is_admin === 1 ? "admin" : "user";
    }
    if (config.username === true) {
        result.username = userInfo.username;
    }
    if (config.passwordRequired === true) {
        result.passwordRequired = Boolean(userInfo.password_required);
    }
    return result
}

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
        if (user?.avatar_name == null) return null;
        return user.avatar_name;
    }
    static getUserInfo({ id, config = {} } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("Invalid user ID", "id");
        }
        const userInfo = ProfilesModel.getUserInfo(id);
        if (userInfo == null) return {};
        const result = genUserInfoResult(config, userInfo);
        return result;
    }
    static getUserInfoBatch({ idList, config = {} } = {}) {
        let result = [];
        if (idList === "all") {
            result = ProfilesServer.getAllUserInfo({ config });
        } else {
            if (!Array.isArray(idList)) {
                throw new ValidationError(`id列表必须是"all"字段或者id列表`);
            }
            for (const id of idList) {
                if (!isUnsignedIntegerString(id)) {
                    continue;
                }
                result.push(ProfilesServer.getUserInfo({ id, config }));
            }
        }
        return result;
    }
    static getAllUserInfo({ config = {} } = {}) {
        const userInfoList = ProfilesModel.getAllUserInfo();
        const resultList = [];
        for (const userInfo of userInfoList) {
            const result = genUserInfoResult(config, userInfo);
            resultList.push(result);
        }
        return resultList;
    }
}
module.exports = ProfilesServer;