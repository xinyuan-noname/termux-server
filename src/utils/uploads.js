const fs = require("fs");
const path = require("path")
const dirConfig = require("../config/paths");
/**
 * 
 * @param {string} dir 
 * @param {string} filepath 
 * @returns 
 */
function safeGetUploadsFilePath(dir, filepath) {
    try {
        const uploadFilePath = path.resolve(dir, filepath);
        fs.accessSync(uploadFilePath);
        return uploadFilePath
    } catch {
        return null;
    }
}

function safeGetTaskPath(filepath) {
    return safeGetUploadsFilePath(dirConfig.TASK_DIR, filepath);
}

function checkAvatarExist(filename) {
    return Boolean(safeGetAvatarPath(filename));
}
function getAvatarPath(filename) {
    return path.resolve(dirConfig.AVATAR_DIR, filename);
}
function safeGetAvatarPath(filename) {
    return safeGetUploadsFilePath(dirConfig.AVATAR_DIR, filename)
}
module.exports = {
    safeGetUploadsFilePath,
    checkAvatarExist,
    getAvatarPath,
    safeGetAvatarPath,
    safeGetTaskPath
}