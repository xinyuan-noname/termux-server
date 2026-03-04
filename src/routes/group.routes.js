const express = require('express');
const access = require('../middleware/access');
const GroupController = require('../controllers/group.controller');
const router = express.Router();

router.use('/', access);

router.get('/entire', GroupController.getEntireGroup);

router.get('/admin', GroupController.getAdminGroup);

router.get('/male', GroupController.getMaleGroup);

router.get('/female', GroupController.getFemaleGroup);

router.get('/no-gender', GroupController.getNoGenderGroup);

router.get('/position', GroupController.getHavePositionGroup);

router.get('/user', GroupController.getUserGroup);

module.exports = router;