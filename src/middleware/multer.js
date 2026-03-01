const multer = require('multer');
const fs = require('fs');
const dirConfig = require('../config/paths');
const logger = require('../logger');
const path = require('path');
const { generateRandomSafeString } = require('../utils/verification');
const { EXCEL_MIMES, IMAGE_MIMES, EXCEL_EXTS } = require('../config/uploads');
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
const memoryStorage = multer.memoryStorage();
const avatarFileFilter = (req, file, cb) => {
    if (IMAGE_MIMES.includes(file?.mimetype)) {
        logger.info(`收到上传的头像, 来自${req?.access?.id}`, { ...file, req: req.requestId });
        cb(null, true);
    } else {
        cb(new Error('头像仅支持 image 文件'), false);
    }
};
const excelFileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).slice(1);
    if (EXCEL_MIMES.includes(file.mimetype) || EXCEL_EXTS.some(ext => ext === extension)) {
        logger.info(`收到上传的excel文件`,  { ...file, req: req.requestId });
        cb(null, true);
    } else {
        cb(new Error('错误的excel文件'), false);
    }
};
const normalLimits = { fileSize: 2 * 1024 * 1024 };
const createMulter = ({ storage, fileFilter, limits = normalLimits }) => {
    return multer({ storage, fileFilter, limits })
}

module.exports = {
    MulterStorage: {
        avatarStorage,
        memoryStorage
    },
    MulterFileFilter: {
        avatarFileFilter,
        excelFileFilter
    },
    MulterLimits: {
        normalLimits
    },
    createMulter
};