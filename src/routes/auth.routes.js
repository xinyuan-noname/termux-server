const express = require('express');
const createRateLimiter = require('../middleware/rateLimit');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();
router.post(
  '/login',
  AuthController.login
);
router.post(
  "/logout",
  AuthController.logout
);
router.post(
  "/refresh",
  AuthController.refresh
);

// 签名格式：id|username|isAdmin
router.post(
  '/register',
  createRateLimiter(5, 10, true, "Too many registration attempts, please try again later."),
  AuthController.register
);
router.post(
  '/register/batch',
  createRateLimiter(5, 3, true, "Too many registration attempts, please try again later."),
  AuthController.registerBatch
)

// 签名格式：id
router.delete(
  '/delete',
  createRateLimiter(5, 10, true, "Too many deletion attempts, please try again later."),
  AuthController.delete
);
router.delete(
  '/delete/batch',
  createRateLimiter(5, 3, true, "Too many deletion attempts, please try again later."),
  AuthController.deleteBatch
);

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