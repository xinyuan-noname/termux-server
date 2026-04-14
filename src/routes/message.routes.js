const express = require('express');
const access = require('../middleware/access');
const MessageController = require('../controllers/message.controller');
const router = express.Router();

router.use('/', access);

router.get('/notice', MessageController.getAllNoticeTasks);
router.get('/remind/pending', MessageController.getAllRemind)

router.get('/to_do/public/list', MessageController.getPublicToDoList);
router.post('/to_do/public/create', MessageController.createPublicToDoItem);
router.patch('/to_do/public/update', MessageController.updatePublicToDoItem);
router.delete('/to_do/public/delete', MessageController.deletePublicToDoItem);
module.exports = router;