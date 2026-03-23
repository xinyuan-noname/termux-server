const path = require('path');
const { APK_DIR, EXE_DIR } = require('../config/paths');
function getApkPath() {
    return path.resolve(APK_DIR, getAppDescription());
}
function getAppDescription() {
    return `${process.env.APP_NAME}v${process.env.APK_VERSION}`
}
function getExePath(){
    return path.resolve(EXE_DIR,getAppDescription)
}
module.exports = {
    getApkPath,
    getExePath,
    getAppDescription
}