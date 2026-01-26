const express = require('express');
const createRateLimiter = require('../middleware/rateLimit');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();
router.post(
  '/login',
  createRateLimiter(5, 5, "Too many login attempts, please try again later."),
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
  createRateLimiter(5, 10, "Too many registration attempts, please try again later."),
  AuthController.register
);

router.post(
  '/register/batch',
  createRateLimiter(5, 3, "Too many registration attempts, please try again later."),
  AuthController.registerBatch
)

router.delete(
  '/delete',
  AuthController.delete
);

router.delete(
  '/delete/batch',
  AuthController.deleteBatch
);
module.exports = router;
