const express = require('express');
const TaskDrawController = require('../controllers/task_draw.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/create', TaskDrawController.createDraw);
router.patch('/update', TaskDrawController.updateDraw);

router.get('/:taskId', TaskDrawController.getDraw);

module.exports = router;
