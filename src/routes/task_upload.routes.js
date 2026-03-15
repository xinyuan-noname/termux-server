const express = require('express');
const TaskUploadController = require('../controllers/task_upload.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);

router.post('/list', TaskUploadController.getUploadsByTaskId);
router.post('/get', TaskUploadController.getUploadById);

router.post('/create', TaskUploadController.createUpload);
router.post('/update', TaskUploadController.updateUpload);
router.post('/delete', TaskUploadController.deleteUpload);
router.post('/delete-by-task', TaskUploadController.deleteUploadsByTaskId);

module.exports = router;
