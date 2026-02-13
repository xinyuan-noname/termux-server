const express = require('express');
const createRateLimiter = require('../middleware/rateLimit');
const AuthController = require('../controllers/auth.controller');
const parseDeviceMiddleware = require("../middleware/parserDevice");
const router = express.Router();
router.use('/', parseDeviceMiddleware);
/// 需要字段 id, username, password
router.post(
  '/login',
  AuthController.login
);
/// 需要字段 refreshToken(Flutter APP)
router.post(
  "/logout",
  AuthController.logout
);
/// 需要字段 refreshToken(Flutter APP)
router.post(
  "/refresh",
  AuthController.refresh
);

/// 需要字段 id, username, password, passwordRequired, isAdmin
// 签名格式：id|username|isAdmin
router.post(
  '/register',
  createRateLimiter(5, 10, true, "Too many registration attempts, please try again later."),
  AuthController.register
);
/// 需要字段 userList
router.post(
  '/register/batch',
  createRateLimiter(5, 3, true, "Too many registration attempts, please try again later."),
  AuthController.registerBatch
)

/// 需要字段 id
// 签名格式：id
router.delete(
  '/delete',
  createRateLimiter(5, 10, true, "Too many deletion attempts, please try again later."),
  AuthController.delete
);
/// 需要字段 userList
router.delete(
  '/delete/batch',
  createRateLimiter(5, 3, true, "Too many deletion attempts, please try again later."),
  AuthController.deleteBatch
);

/// 需要字段id
// 签名格式: id
router.post(
  "/issue/password_key",
  AuthController.issuePasswordKey
)
router.patch(
  "/password",
  AuthController.changePassword
)
router.patch(
  "/password_required",
  AuthController.changePasswordRequired
)

//签名格式: id|isAdmin
router.patch(
  "/admin_status",
  AuthController.changeAdminStatus
)
module.exports = router;