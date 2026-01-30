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

// 签名格式：id|username|isAdmin|createdAt
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

// 签名格式：id|createdAt
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

//
router.patch(
  "/change/password",
  AuthController.changePassword
)


module.exports = router;