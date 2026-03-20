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
/**
 * 
 * @param {string} filepath 
 * @returns 
 */
function safeGetTaskPath(filepath) {
    return safeGetUploadsFilePath(dirConfig.TASK_DIR, filepath);
}
/**
 * 
 * @param {string} filepath 
 */
function safeGetAvatarPath(filepath) {
    return safeGetUploadsFilePath(dirConfig.AVATAR_DIR, filepath)
}


function checkAvatarExist(filepath) {
    return Boolean(safeGetAvatarPath(filepath));
}
function getAvatarPath(filepath) {
    return path.resolve(dirConfig.AVATAR_DIR, filepath);
}
module.exports = {
    safeGetUploadsFilePath,
    checkAvatarExist,
    getAvatarPath,
    safeGetAvatarPath,
    safeGetTaskPath
}