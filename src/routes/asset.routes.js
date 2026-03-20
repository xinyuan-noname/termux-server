const express = require('express');
const access = require('../middleware/access');
const AssetController = require('../controllers/asset.controller');
const createRateLimiter = require('../middleware/rateLimit');
const router = express.Router();
router.use('/', access);
router.get(
    '/avatar/:id',
    createRateLimiter(1, 90), // 60s w=70
    AssetController.getAvatar
)
module.exports = router;