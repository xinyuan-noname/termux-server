const express = require('express');
const createRateLimiter = require('../middleware/rateLimit');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();
router.post(
  '/login',
  createRateLimiter(15, 5, "Too many login attempts, please try again later."),
  AuthController.login
);

router.post(
  "/logout",
  AuthController.logout
);

router.post(
  '/register',
  createRateLimiter(15, 10, "Too many registration attempts, please try again later."),
  AuthController.register
);

router.post(
  '/register/batch',
  createRateLimiter(15, 3, "Too many registration attempts, please try again later."),
  AuthController.registerBatch
)
module.exports = router;
