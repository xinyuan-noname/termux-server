const fs = require("fs");
const path = require("path")
const dirConfig = require("../config/paths");
const mime = require('mime');
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
function createReadStream(filepath){
    return fs.createReadStream(filepath);
}
function getMimeType(filepath){
    return mime.default.getType(filepath);
}
function checkAvatarExist(filename) {
    try {
        const uploadFilePath = getAvatarPath(filename);
        fs.accessSync(uploadFilePath);
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
    safeGetUploadsFilePath,
    checkAvatarExist,
    getAvatarPath,
    safeGetAvatarPath,
    createReadStream,
    getMimeType
}