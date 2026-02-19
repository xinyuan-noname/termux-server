const express = require('express');
const signature = require('../middleware/signature');
const AdminController = require('../controllers/admin.controller');
const router = express.Router();

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



module.exports = router;