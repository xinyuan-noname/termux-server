const express = require('express');
const SubjectsController = require('../controllers/subjects.controller');
const isAdmin = require('../middleware/isAdmin');
const access = require('../middleware/access');
const router = express.Router();
router.use('/', access);
router.get('/all', SubjectsController.getAllSubjects);
router.post('/search/name', SubjectsController.getSubjectByName);
router.post('/search/semester', SubjectsController.getSubjectsBySemester);

router.use(isAdmin);
router.delete('/delete', SubjectsController.deleteSubject);

module.exports = router;