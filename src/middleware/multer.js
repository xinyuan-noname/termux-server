const multer = require('multer');
const fs = require('fs');

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
});
const avatarFileFilter = (req, file, cb) => {
    if (['image/webp'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('头像仅支持 WEBP 格式'), false);
    }
};
const avatarUpload = multer({ storage: avatarStorage, fileFilter: avatarFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = {
    avatarUpload,
};