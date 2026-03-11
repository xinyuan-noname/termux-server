const express = require('express');
const SubjectsController = require('../controllers/subjects.controller');
const isAdmin = require('../middleware/isAdmin');
const access = require('../middleware/access');
const router = express.Router();
router.use(access);
router.get('/all', SubjectsController.getAllSubjects);
router.post('/search', SubjectsController.getSubjectByName);
router.post('/by-semester', SubjectsController.getSubjectsBySemester);

router.use(isAdmin);

router.post('/create', SubjectsController.createSubject);
router.put('/update', SubjectsController.updateSubject);
router.patch('/teachers', SubjectsController.updateSubjectTeachers);
router.patch('/courses', SubjectsController.updateSubjectCourses);
router.patch('/alias', SubjectsController.updateSubjectAlias);
router.patch('/semester', SubjectsController.updateSubjectSemester);
router.delete('/delete', SubjectsController.deleteSubject);

module.exports = router;