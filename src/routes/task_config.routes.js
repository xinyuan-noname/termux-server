const express = require('express');
const TaskConfigController = require('../controllers/task_config.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/create', TaskConfigController.createTask);
router.patch('/update', TaskConfigController.updateTask);

router.get('/all', TaskConfigController.getAllTasks);
router.post('/:id', TaskConfigController.getTaskById);


router.delete('/delete', TaskConfigController.deleteTask);

module.exports = router;