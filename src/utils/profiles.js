const fs = require("fs");
const path = require("path")
const dirConfig = require("../config/paths")
function checkAvatarExist(filename) {
    try {
        const avatarPath = getAvatarPath(filename);
        fs.accessSync(avatarPath);
        return true;
    } catch {
        return false;
    }
}
function getAvatarPath(filename) {
    return path.resolve(dirConfig.AVATAR_DIR, filename);
}
function safeGetAvatarPath(filename) {
    try {
        const avatarPath = getAvatarPath(filename);
        fs.accessSync(avatarPath);
        return avatarPath
    } catch {
        return null;
    }
}
module.exports = {
    checkAvatarExist,
    getAvatarPath,
    safeGetAvatarPath
}