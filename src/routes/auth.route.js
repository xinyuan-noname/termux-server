const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// 登录路由
router.post('/login', AuthController.login);

// 注册路由
router.post('/register', AuthController.register);

// 批量注册路由
router.post('/register/batch', AuthController.registerBatch);

module.exports = router;