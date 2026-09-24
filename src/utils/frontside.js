const path = require('path');
const { APK_DIR } = require('../config/paths');
function getApkPath() {
    return path.resolve(APK_DIR, getApkDescription());
}
function getApkDescription() {
    return `${process.env.APP_NAME}v${process.env.APK_VERSION}`
}
module.exports = {
    getApkPath
}