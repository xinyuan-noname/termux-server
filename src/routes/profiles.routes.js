const express = require('express');
const access = require('../middleware/access');
const ProfilesController = require('../controllers/profiles.controller');
const { avatarUpload } = require('../middleware/multer');
const router = express.Router();
router.use('/', access);

router.post('/avatar', avatarUpload.single("avatar"), ProfilesController.uploadAvatar);

router.get('/avatar/:id', ProfilesController.getAvatar)

module.exports = router;