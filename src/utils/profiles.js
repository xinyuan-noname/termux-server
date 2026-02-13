const fs = require("fs");
const path = require("path")
const dirConfig = require("../../config/paths")
function checkAvatarExist(filename) {
    try {
        fs.accessSync(path.resolve(dirConfig.AVATAR_DIR, filename));
        return true;
    } catch {
        return false;
    }
}
function getAvatarPath(filename){
    return path.resolve(dirConfig, filename);
}
module.exports = {
    checkAvatarExist,
    getAvatarPath
}