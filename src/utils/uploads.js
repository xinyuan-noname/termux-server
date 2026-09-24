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
/**
 * 获取 uploads/images 下存在的图片路径
 * @param {string} filepath 
 * @returns {string|null}
 */
function safeGetImagePath(filepath) {
    return safeGetUploadsFilePath(dirConfig.IMAGE_DIR, filepath)
}


function checkAvatarExist(filepath) {
    return Boolean(safeGetAvatarPath(filepath));
}


function resolveAvatarPath(filepath) {
    return path.resolve(dirConfig.AVATAR_DIR, filepath);
}
function resolveTaskPath(filepath) {
    return path.resolve(dirConfig.TASK_DIR, filepath);
}
function resolveImagePath(filepath) {
    return path.resolve(dirConfig.IMAGE_DIR, filepath);
}
module.exports = {
    safeGetUploadsFilePath,
    checkAvatarExist,
    safeGetAvatarPath,
    safeGetTaskPath,
    safeGetImagePath,
    resolveAvatarPath,
    resolveTaskPath,
    resolveImagePath
}