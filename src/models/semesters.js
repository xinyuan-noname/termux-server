const db = require("../database/db");

class SemestersModel {
    static createSemester(semester_name, started_at, phase_list) {
        const stmt = db.prepare("INSERT INTO semesters (semester_name, started_at, phase_list) VALUES (?, ?, ?)");
        return stmt.run(semester_name, started_at, JSON.stringify(phase_list));
    }

    static findSemesterByName(semester_name) {
        const stmt = db.prepare("SELECT * FROM semesters WHERE semester_name = ?");
        return stmt.get(semester_name);
    }

    static findAllSemesters() {
        const stmt = db.prepare("SELECT * FROM semesters");
        return stmt.all();
    }

    static updateSemester(semester_name, started_at, phase_list) {
        const stmt = db.prepare("UPDATE semesters SET started_at = ?, phase_list = ? WHERE semester_name = ?");
        return stmt.run(started_at, JSON.stringify(phase_list), semester_name);
    }

    static deleteSemester(semester_name) {
        const stmt = db.prepare("DELETE FROM semesters WHERE semester_name = ?");
        return stmt.run(semester_name);
    }

    static getCurrentSemester() {
        const stmt = db.prepare("SELECT * FROM semesters ORDER BY started_at DESC LIMIT 1");
        return stmt.get();
    }
}

module.exports = SemestersModel;