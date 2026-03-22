const express = require('express');
const access = require('../middleware/access');
const AssetController = require('../controllers/asset.controller');
const createRateLimiter = require('../middleware/rateLimit');
const { createMulter, MulterStorage, MulterFileFilter } = require('../middleware/multer');
const router = express.Router();
const taskUpload = createMulter({
    storage: MulterStorage.memoryStorage,
    fileFilter: MulterFileFilter.documentFileFilter
});
router.use('/', access);
router.get(
    '/avatar/:id',
    createRateLimiter(1, 90), // 60s w=70
    AssetController.getAvatar
)
router.post(
    '/pdf/convert/document',
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
    )
router.route('/apk')
    .get(
        createRateLimiter(1, 10),
        AssetController.getApk
    )
    // .head(
    //     createRateLimiter(1, 40)
    //     AssetController
    // )
module.exports = router;