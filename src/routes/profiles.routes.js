const express = require('express');
const access = require('../middleware/access');
const ProfilesController = require('../controllers/profiles.controller');
const { createMulter, MulterStorage, MulterFileFilter } = require('../middleware/multer');
const router = express.Router();
router.use('/', access);

const avatarUpload = createMulter({
    storage: MulterStorage.avatarStorage,
    fileFilter: MulterFileFilter.avatarFileFilter
});

router.post(
    '/avatar',
    avatarUpload.single("avatar"),
    ProfilesController.uploadAvatar
);

router.get(
    '/avatar/:id',
    ProfilesController.getAvatar
)

// 需要字段: idList config
// config:
// gender userType username passwordRequired
router.post(
    '/search/user',
    ProfilesController.getUserInfoBatch
)

// 需要config一致
router.post(
    '/user/:id',
    ProfilesController.getUserInfo
)

router.get(
    '/my',
    ProfilesController.myProfile
)

router.get(
    '/my/avatar',
    ProfilesController.myAvatar
)

module.exports = router;