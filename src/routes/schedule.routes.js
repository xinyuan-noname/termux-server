const express = require('express');
const ScheduleController = require('../controllers/schedule.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.get('/current', ScheduleController.getCurrentSchedule);

module.exports = router;