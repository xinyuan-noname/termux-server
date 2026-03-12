const SemestersService = require("../service/semesters.service");

class SemestersController {
    /**
     * POST /semesters/create
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async createSemester(req, res) {
        const { semesterName, startedAt, phaseList } = req.body;

        await SemestersService.createSemester({
            semesterName,
            startedAt,
            phaseList
        });

        return res.status(201).end();
    }

    /**
     * POST /semesters/list
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async getAllSemesters(req, res) {
        const result = await SemestersService.getAllSemesters();
        return res.json(result);
    }

    /**
     * POST /semesters/update
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async updateSemester(req, res) {
        const { semesterName, startedAt, phaseList } = req.body;

        await SemestersService.updateSemester({
            semesterName,
            startedAt,
            phaseList
        });

        return res.status(204).end();
    }

    /**
     * POST /semesters/delete
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async deleteSemester(req, res) {
        const { semesterName } = req.body;

        await SemestersService.deleteSemester({
            semesterName
        });

        return res.status(204).end();
    }

    /**
     * POST /semesters/current
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async getCurrentSemester(req, res) {
        const result = await SemestersService.getCurrentSemester();
        return res.json(result);
    }
}

module.exports = SemestersController;