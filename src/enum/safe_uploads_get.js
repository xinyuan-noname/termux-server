const { safeGetAvatarPath, safeGetTaskPath } = require("../utils/uploads");

const SafeGetUploadsFilePath = {
    avatar: safeGetAvatarPath,
    task: safeGetTaskPath
}
module.exports = SafeGetUploadsFilePath;