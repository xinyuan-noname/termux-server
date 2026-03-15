const express = require('express');
const TaskConfigController = require('../controllers/task_config.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/create', TaskConfigController.createTask);
router.patch('/update', TaskConfigController.updateTask);

router.post('/list', TaskConfigController.getAllTasks);
router.post('/:id', TaskConfigController.getTaskById);


router.post('/delete', TaskConfigController.deleteTask);

module.exports = router;