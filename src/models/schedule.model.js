const db = require("../database/db");

class ScheduleModel {
    static getScheduleBySemester(semester) {
        const stmt = db.prepare("SELECT * FROM schedule WHERE semester = ?");
        return stmt.all(semester);
    }
}
module.exports = ScheduleModel;