const SemestersService = require("../service/semesters.service");
const SubjectsService = require("../service/subjects.service");

class SubjectsController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getSubjectByName(req, res) {
        const { subjectName } = req.body;
        const subject =  SubjectsService.getSubjectByName({ subjectName });
        return res.json(subject);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getSubjectsBySemester(req, res) {
        const { semester } = req.body;
        const subjects = SubjectsService.getSubjectsBySemester({ semester });
        return res.json(subjects);
    }

    static getCurrentSubjects(req, res) {
        const semesterInfo = SemestersService.getCurrentSemester();
        const semester = semesterInfo.semesterName;
        const subjects = SubjectsService.getSubjectsBySemester({ semester });
        return res.json(subjects);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static deleteSubject(req, res) {
        const { subjectName } = req.body;
        SubjectsService.deleteSubject({ subjectName });
        return res.status(204).end();
    }

}

module.exports = SubjectsController;