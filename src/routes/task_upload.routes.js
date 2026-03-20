const express = require('express');
const TaskUploadController = require('../controllers/task_upload.controller');
const access = require('../middleware/access');
const { createMulter, MulterStorage } = require('../middleware/multer');
const router = express.Router();

const taskUpload = createMulter({
    storage: MulterStorage.taskStorage,
});

router.use('/', access);

router.post('/', taskUpload.single("upload"), TaskUploadController.uploadFile);

router.get('/my', TaskUploadController.getMyUploads);
router.get('/list/:taskId', TaskUploadController.getUploadsByTaskId);

router.get('/file/:taskId/:uploadId', TaskUploadController.getStreamFile);
router.get('/view/document/:taskId/:uploadId', TaskUploadController.getStreamDocumentView);

router.delete('/delete', TaskUploadController.deleteUpload);

module.exports = router;