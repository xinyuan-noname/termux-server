const express = require('express');
const AuthController = require('../controllers/auth.controller');
const parseDeviceMiddleware = require("../middleware/parserDevice");
const access = require('../middleware/access');
const router = express.Router();
router.use('/', parseDeviceMiddleware);
/// 需要字段 id, username, password
router.post(
  '/login',
  AuthController.login
);
/// 需要字段 refreshToken(Flutter APP)
router.post(
  "/refresh",
  AuthController.refresh
);
/// 需要字段 refreshToken(Flutter APP)
router.post(
  "/logout",
  access,
  AuthController.logout
);

/// 需要字段id
router.post(
  "/issue/password_key",
  access,
  AuthController.issuePasswordKey
)
/// 需要字段passwordKey, newPassword
router.patch(
  "/reset_password",
  access,
  AuthController.resetPassword
)

/// 需要字段passwordRequired 
router.patch(
  "/password_required",
  access,
  AuthController.changePasswordRequired
)

module.exports = router;