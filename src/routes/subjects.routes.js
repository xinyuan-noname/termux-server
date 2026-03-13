const express = require('express');
const SubjectsController = require('../controllers/subjects.controller');
const access = require('../middleware/access');
const router = express.Router();
router.use('/', access);
router.post('/search/name', SubjectsController.getSubjectByName);
router.post('/search/semester', SubjectsController.getSubjectsBySemester);
router.get('/current', SubjectsController.getCurrentSubjects);
module.exports = router;