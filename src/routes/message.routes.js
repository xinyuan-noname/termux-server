const express = require('express');
const access = require('../middleware/access');
const MessageController = require('../controllers/message.controller');
const router = express.Router();

router.use('/', access);

router.get('/notice', MessageController.getAllNoticeTasks);

router.get('/remind/pending', MessageController.getAllRemind)

module.exports = router;