const express = require('express');
const TaskConfigController = require('../controllers/task_config.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/list', TaskConfigController.getAllTasks);
router.post('/:id', TaskConfigController.getTaskById);
router.post('/search/by-subject', TaskConfigController.getTasksBySubject);

router.post('/create', TaskConfigController.createTask);
router.post('/update', TaskConfigController.updateTask);
router.post('/delete', TaskConfigController.deleteTask);

module.exports = router;
