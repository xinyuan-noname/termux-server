const express = require('express');
const SemestersController = require('../controllers/semesters.controller');
const access = require('../middleware/access');
const router = express.Router();

router.use('/', access);
router.post('/create', SemestersController.createSemester);
router.post('/update', SemestersController.updateSemester);
router.post('/delete', SemestersController.deleteSemester);

router.post('/search/name',SemestersController.getCurrentSemester)
router.get('/all', SemestersController.getAllSemesters);
router.get('/current', SemestersController.getCurrentSemester);

module.exports = router;