const multer = require('multer');
const fs = require('fs');
const dirConfig = require('../config/paths');
const logger = require('../logger');
const path = require('path');
const { generateRandomSafeString } = require('../utils/verification');
const { EXCEL_MIMES, IMAGE_MIMES, EXCEL_EXTS } = require('../config/uploads');
const { canConvertToPdf } = require('../utils/file');
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
const taskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = dirConfig.TASK_DIR;
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
        logger.info(`收到上传的excel文件`, { ...file, req: req.requestId });
        cb(null, true);
    } else {
        cb(new Error('错误的excel文件'), false);
    }
};
const normalLimits = { fileSize: 5 * 1024 * 1024 };

/**
 * 允许所有文件通过的文件过滤器
 * @param {Object} req - Express 请求对象
 * @param {Object} file - 上传的文件对象
 * @param {Function} cb - 回调函数
 */
const allowAllFilesFilter = (req, file, cb) => {
    logger.info(`收到上传的文件`, { ...file, req: req.requestId });
    cb(null, true);
};

/**
 * 文档文件过滤器，允许文档格式
 * @param {Object} req - Express 请求对象
 * @param {Object} file - 上传的文件对象
 * @param {Function} cb - 回调函数
 */
const documentFileFilter = (req, file, cb) => {
    if (canConvertToPdf(file.originalname)) {
        logger.info(`收到文档文件`, { ...file, req: req.requestId });
        cb(null, true);
    } else {
        cb(new Error('仅支持文档格式(doc, docx, xls, xlsx, ppt, pptx, pdf)'), false);
    }
};

const createMulter = ({ storage, fileFilter, limits = normalLimits }) => {
    return multer({ storage, fileFilter, limits })
}

module.exports = {
    MulterStorage: {
        avatarStorage,
        taskStorage,
        memoryStorage
    },
    MulterFileFilter: {
        avatarFileFilter,
        excelFileFilter,
        allowAllFilesFilter,
        documentFileFilter
    },
    MulterLimits: {
        normalLimits
    },
    createMulter
};