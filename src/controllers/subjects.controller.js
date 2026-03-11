const SubjectsService = require("../service/subjects.service");

class SubjectsController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async createSubject(req, res) {
        const { subject_name, alias, teachers, courses, semester } = req.body;
        const result = await SubjectsService.createSubject({
            subject_name,
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
        const { subject_name } = req.body;
        const subject = await SubjectsService.getSubjectByName({ subject_name });
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
        const { subject_name, alias, teachers, courses, semester } = req.body;
        const result = await SubjectsService.updateSubject({
            subject_name,
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
        const { subject_name } = req.body;
        await SubjectsService.deleteSubject({ subject_name });
        return res.status(204).end();
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectTeachers(req, res) {
        const { subject_name, teachers } = req.body;
        const result = await SubjectsService.updateSubjectTeachers({ subject_name, teachers });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectCourses(req, res) {
        const { subject_name, courses } = req.body;
        const result = await SubjectsService.updateSubjectCourses({ subject_name, courses });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectAlias(req, res) {
        const { subject_name, alias } = req.body;
        const result = await SubjectsService.updateSubjectAlias({ subject_name, alias });
        return res.json(result);
    }

    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async updateSubjectSemester(req, res) {
        const { subject_name, semester } = req.body;
        const result = await SubjectsService.updateSubjectSemester({ subject_name, semester });
        return res.json(result);
    }
}

module.exports = SubjectsController;