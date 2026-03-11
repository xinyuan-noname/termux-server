const SubjectsService = require("../service/subjects.service");

class SubjectsController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async createSubject(req, res) {
        const { subjectName, alias, teachers, courses, semester } = req.body;
        const result = await SubjectsService.createSubject({
            subjectName,
            alias,
            teachers,
            courses,
            semester
        });
        return res.status(201).json(result);
    }

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
    static async updateSubject(req, res) {
        const { subjectName, alias, teachers, courses, semester } = req.body;
        const result = await SubjectsService.updateSubject({
            subjectName,
            alias,
            teachers,
            courses,
            semester
        });
        return res.json(result);
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

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectTeachers(req, res) {
        const { subjectName, teachers } = req.body;
        const result = await SubjectsService.updateSubjectTeachers({ subjectName, teachers });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectCourses(req, res) {
        const { subjectName, courses } = req.body;
        const result = await SubjectsService.updateSubjectCourses({ subjectName, courses });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectAlias(req, res) {
        const { subjectName, alias } = req.body;
        const result = await SubjectsService.updateSubjectAlias({ subjectName, alias });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectSemester(req, res) {
        const { subjectName, semester } = req.body;
        const result = await SubjectsService.updateSubjectSemester({ subjectName, semester });
        return res.json(result);
    }
}

module.exports = SubjectsController;