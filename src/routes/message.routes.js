const express = require('express');
const access = require('../middleware/access');
const MessageController = require('../controllers/message.controller');
const router = express.Router();

router.use('/', access);

router.get('/notice', MessageController.getAllNoticeTasks);
router.get('/remind/pending', MessageController.getAllRemind)

router.get('/to_do/list', MessageController.getToDoList);
router.post('/to_do/create', MessageController.addToDoItem);
router.patch('/to_do/update', MessageController.updateToDoItem);
router.delete('/to_do/delete', MessageController.deleteToDoItem);
module.exports = router;