const express = require('express');
const signature = require('../middleware/signature');
const AdminController = require('../controllers/admin.controller');
const router = express.Router();

router.post(
    '/check',
    signature.single(["word"]),
    AdminController.check
);

// 需要字段: idList config
// config:
// gender userType username passwordRequired
router.post(
    '/search/user',
    signature.single(['word']),
    AdminController.getUserInfoBatch
)

router.post(
    "/register",
    signature.single(["id", "username", "isAdmin"]),
    AdminController.register
);

router.post(
    '/register/batch',
    signature.batch("userList", ["id", "username", "isAdmin"]),
    AdminController.registerBatch
)


router.patch(
    "/admin_status",
    signature.single(["id", "isAdmin"]),
    AdminController.changeAdminStatus
)


router.delete(
    '/delete',
    signature.single(["id"]),
    AdminController.delete
);

router.delete(
    '/delete/batch',
    signature.batch("userList", ["id"]),
    AdminController.deleteBatch
);

router.post(
    "/issue/password_key",
    signature.single(["id"]),
    AdminController.issuePasswordKey
)

module.exports = router;