const db = require("../database/db");

class SubjectsModel {

    static getSubjectByName(subject_name) {
        const stmt = db.prepare("SELECT * FROM subject_info WHERE subject_name = ?");
        return stmt.get(subject_name);
    }

    static getAllSubjects() {
        const stmt = db.prepare("SELECT * FROM subject_info");
        return stmt.all();
    }

    static getSubjectsBySemester(semester) {
        const stmt = db.prepare("SELECT * FROM subject_info WHERE semester = ?");
        return stmt.all(semester);
    }

    static deleteSubject(subject_name) {
        const stmt = db.prepare("DELETE FROM subject_info WHERE subject_name = ?");
        return stmt.run(subject_name);
    }
}

module.exports = SubjectsModel;