const express = require('express');
const SemestersController = require('../controllers/semesters.controller');
const access = require('../middleware/access');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
router.use('/', access);
router.get('/all', SemestersController.getAllSemesters);
router.get('/current', SemestersController.getCurrentSemester);

router.use('/', isAdmin);
router.post('/create', SemestersController.createSemester);
router.post('/search/name', SemestersController.getCurrentSemester)

router.put('/update', SemestersController.updateSemester);
router.delete('/delete', SemestersController.deleteSemester);



module.exports = router;