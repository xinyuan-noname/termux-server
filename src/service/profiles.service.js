const { BASICE_PROFILES_SEARCH_CONFGI } = require("../config/profiles");
const { ValidationError, NotFoundError } = require("../error");
const ProfilesModel = require("../models/profiles.model");
const UserLikeService = require("./user_like.service");
const { checkAvatarExist, safeGetAvatarPath } = require("../utils/uploads");
const { isUnsignedIntegerString } = require("../utils/validation");

/**
 * 给用户信息补上获赞数与"我今天是否赞过"
 * @param {Object} result - 待返回的用户信息
 * @param {Object} config - 字段开关
 * @param {string} userId - 用户 ID
 * @param {Object|null} likeOverview - 点赞总览
 */
const attachLikeInfo = (result, config, userId, likeOverview) => {
    if (config.likeCount !== true || likeOverview == null) return;
    result.likeCount = likeOverview.countMap.get(userId) ?? 0;
    result.likedToday = likeOverview.likedIdSet.has(userId);
}

const genUserInfoResult = (config, userInfo) => {
    const result = { id: userInfo.id };
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
    if (config.position === true) {
        result.position = userInfo.position;
    }
    if (config.class === true) {
        result.class = userInfo.class;
    }
    if (config.major === true) {
        result.major = userInfo.major;
    }
    if (config.academy === true) {
        result.academy = userInfo.academy;
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
    static getAvatarName({ id }) {
        const user = ProfilesModel.getAvatarName(id);
        if (user?.avatar_name == null) return null;
        return user.avatar_name;
    }
    static getAvatarPath({ id }) {
        const avatarName = ProfilesServer.getAvatarName({ id });
        const avatarPath = safeGetAvatarPath(avatarName);
        if (avatarPath == null) {
            throw new NotFoundError(`未找到${id}头像`);
        }
        return avatarPath;
    }
    static getUserInfo({ id, config = BASICE_PROFILES_SEARCH_CONFGI, viewerId }) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        const userInfo = ProfilesModel.getUserInfo(id);
        if (userInfo == null) return {};
        const result = genUserInfoResult(config, userInfo);
        attachLikeInfo(result, config, id, ProfilesServer.#likeOverview(config, viewerId));
        return result;
    }
    static getUserInfoBatch({ idList, config = BASICE_PROFILES_SEARCH_CONFGI, viewerId }) {
        let result = [];
        if (idList === "all") {
            result = ProfilesServer.getAllUserInfo({ config, viewerId });
        } else if (idList === "admin") {
            result = ProfilesServer.getAllAdminInfo({ config, viewerId })
        } else {
            if (!Array.isArray(idList)) {
                throw new ValidationError(`id列表必须是特定字段或者id列表`);
            }
            for (const id of idList) {
                if (!isUnsignedIntegerString(id)) {
                    continue;
                }
                result.push(ProfilesServer.getUserInfo({ id, config, viewerId }));
            }
        }
        return result;
    }
    static getAllUserInfo({ config = BASICE_PROFILES_SEARCH_CONFGI, viewerId } = {}) {
        const userInfoList = ProfilesModel.getAllUserInfo();
        const likeOverview = ProfilesServer.#likeOverview(config, viewerId);
        const resultList = [];
        for (const userInfo of userInfoList) {
            const result = genUserInfoResult(config, userInfo);
            attachLikeInfo(result, config, userInfo.id, likeOverview);
            resultList.push(result);
        }
        return resultList;
    }
    static getAllAdminInfo({ config = BASICE_PROFILES_SEARCH_CONFGI, viewerId } = {}) {
        const userInfoList = ProfilesModel.getAllAdminInfo();
        const likeOverview = ProfilesServer.#likeOverview(config, viewerId);
        const resultList = [];
        for (const userInfo of userInfoList) {
            const result = genUserInfoResult(config, userInfo);
            attachLikeInfo(result, config, userInfo.id, likeOverview);
            resultList.push(result);
        }
        return resultList;
    }

    /**
     * 需要展示获赞数时, 一次性取出所有人的赞数, 避免逐条查询
     * @private
     * @param {Object} config - 字段开关
     * @param {string} [viewerId] - 请求方 ID
     * @returns {Object|null} 点赞总览
     */
    static #likeOverview(config, viewerId) {
        if (config?.likeCount !== true) return null;
        return UserLikeService.getLikeOverview({ viewerId });
    }

    static changeGender({ id, gender }) {
        if (!["male", "female", null].includes(gender)) {
            throw new ValidationError("无效的性别");
        }
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        ProfilesModel.updateGender(id, gender);
    }

    static changeAcademy({ id, academy }) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        ProfilesModel.updateAcademy(id, academy);
    }
    static changeClass({ id, "class": $class }) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        ProfilesModel.updateClass(id, $class);
    }

    static changeMajor({ id, major }) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        ProfilesModel.updateMajor(id, major);
    }

    static changePosition({ id, position }) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("无效的ID", "id");
        }
        ProfilesModel.updatePosition(id, position);
    }
}
module.exports = ProfilesServer;