const express = require('express');
const TaskUploadController = require('../controllers/task_upload.controller');
const access = require('../middleware/access');
const { createMulter, MulterStorage, MulterFileFilter } = require('../middleware/multer');
const router = express.Router();

const taskUpload = createMulter({
    storage: MulterStorage.taskStorage,
    fileFilter: MulterFileFilter.taskFileFilter
});

router.use('/', access);

router.post('/', taskUpload.single("upload"), TaskUploadController.uploadFile);

router.post('/list', TaskUploadController.getUploadsByTaskId);
router.post('/search', TaskUploadController.getUploadById);

router.post('/delete', TaskUploadController.deleteUpload);

module.exports = router;