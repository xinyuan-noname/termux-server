const SemestersService = require("../service/semesters.service");

class SemestersController {
    /**
     * POST /semesters/create
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async createSemester(req, res) {
        const { semester_name, started_at, phase_list } = req.body;

        await SemestersService.createSemester({
            semester_name,
            started_at,
            phase_list
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
        const { semester_name, started_at, phase_list } = req.body;

        await SemestersService.updateSemester({
            semester_name,
            started_at,
            phase_list
        });

        return res.status(204).end();
    }

    /**
     * POST /semesters/delete
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    static async deleteSemester(req, res) {
        const { semester_name } = req.body;

        await SemestersService.deleteSemester({
            semester_name
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