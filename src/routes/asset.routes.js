const express = require('express');
const access = require('../middleware/access');
const AssetController = require('../controllers/asset.controller');
const createRateLimiter = require('../middleware/rateLimit');
const { createMulter, MulterStorage, MulterFileFilter } = require('../middleware/multer');
const { TODO_IMAGE_MAX_SIZE } = require('../config/uploads');
const router = express.Router();
const taskUpload = createMulter({
    storage: MulterStorage.memoryStorage,
    fileFilter: MulterFileFilter.documentFileFilter
});
const imageUpload = createMulter({
    storage: MulterStorage.memoryStorage,
    fileFilter: MulterFileFilter.imageFileFilter,
    limits: { fileSize: TODO_IMAGE_MAX_SIZE }
});
router.get(
    '/avatar/:id',
    createRateLimiter(1, 90), // 60s w=70
    AssetController.getAvatar
)
router.post(
    '/image',
    access,
    createRateLimiter(1, 20), // 60s w=20
    imageUpload.single('image'),
    AssetController.uploadImage
);
router.get(
    '/image/:name',
    createRateLimiter(1, 90),
    AssetController.getImage
);
router.post(
    '/pdf/convert/document',
    access,
    createRateLimiter(1, 30), // 60s w=10
    taskUpload.single('document'),
    AssetController.convertDocumentToPdf
);
router.route('/pdf/:address')
    .get(
        createRateLimiter(1, 30),
        AssetController.getPdf
    )
    .head(
        createRateLimiter(1, 40),
        AssetController.existPdf
    );
module.exports = router;