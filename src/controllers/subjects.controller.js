const SubjectsService = require("../service/subjects.service");

class SubjectsController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async getSubjectByName(req, res) {
        const { subjectName } = req.body;
        const subject = await SubjectsService.getSubjectByName({ subjectName });
        return res.json(subject);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async getAllSubjects(req, res) {
        const subjects = await SubjectsService.getAllSubjects();
        return res.json(subjects);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async getSubjectsBySemester(req, res) {
        const { semester } = req.body;
        const subjects = await SubjectsService.getSubjectsBySemester({ semester });
        return res.json(subjects);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async deleteSubject(req, res) {
        const { subjectName } = req.body;
        await SubjectsService.deleteSubject({ subjectName });
        return res.status(204).end();
    }

}

module.exports = SubjectsController;