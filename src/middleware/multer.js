const multer = require('multer');
const fs = require('fs');
const dirConfig = require('../../config/paths');
const logger = require('../logger');
const path = require('path');
const { generateRandomSafeString } = require('../utils/verification');
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = dirConfig.AVATAR_DIR;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = generateRandomSafeString(16) + ext;
        cb(null, filename);
    }
});
const avatarFileFilter = (req, file, cb) => {
    if (file?.mimetype?.startsWith?.('image')) {
        logger.info(`收到上传的头像, 来自${req?.access?.id}`, file);
        cb(null, true);
    } else {
        cb(new Error('头像仅支持 image 文件'), false);
    }
};
const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = {
    avatarUpload,
};