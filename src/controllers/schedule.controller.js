const ScheduleService = require("../service/schedule.service");
const SemestersService = require("../service/semesters.service");

class ScheduleController {
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static getCurrentSchedule(req, res) {
        const semesterInfo = SemestersService.getCurrentSemester();
        const semester = semesterInfo.semesterName;
        const schedule = ScheduleService.getSubjectsBySemester({ semester });
        return res.json(schedule);
    }
}

module.exports = ScheduleController;