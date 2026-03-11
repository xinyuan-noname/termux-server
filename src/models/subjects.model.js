const db = require("../database/db");

class SubjectsModel {
    static createSubject(subject_name, alias, teachers, courses, semester) {
        const stmt = db.prepare("INSERT INTO subjects (subject_name, alias, teachers, courses, semester) VALUES (?, ?, ?, ?, ?)");
        return stmt.run(subject_name, alias, JSON.stringify(teachers), JSON.stringify(courses), semester);
    }

    static getSubjectByName(subject_name) {
        const stmt = db.prepare("SELECT * FROM subjects WHERE subject_name = ?");
        return stmt.get(subject_name);
    }

    static getAllSubjects() {
        const stmt = db.prepare("SELECT * FROM subjects");
        return stmt.all();
    }

    static getSubjectsBySemester(semester) {
        const stmt = db.prepare("SELECT * FROM subjects WHERE semester = ?");
        return stmt.all(semester);
    }

    static updateSubject(subject_name, alias, teachers, courses, semester) {
        const stmt = db.prepare("UPDATE subjects SET alias = ?, teachers = ?, courses = ?, semester = ? WHERE subject_name = ?");
        return stmt.run(alias, JSON.stringify(teachers), JSON.stringify(courses), semester, subject_name);
    }

    static deleteSubject(subject_name) {
        const stmt = db.prepare("DELETE FROM subjects WHERE subject_name = ?");
        return stmt.run(subject_name);
    }

    static updateSubjectTeachers(subject_name, teachers) {
        const stmt = db.prepare("UPDATE subjects SET teachers = ? WHERE subject_name = ?");
        return stmt.run(JSON.stringify(teachers), subject_name);
    }

    static updateSubjectCourses(subject_name, courses) {
        const stmt = db.prepare("UPDATE subjects SET courses = ? WHERE subject_name = ?");
        return stmt.run(JSON.stringify(courses), subject_name);
    }

    static updateSubjectAlias(subject_name, alias) {
        const stmt = db.prepare("UPDATE subjects SET alias = ? WHERE subject_name = ?");
        return stmt.run(alias, subject_name);
    }

    static updateSubjectSemester(subject_name, semester) {
        const stmt = db.prepare("UPDATE subjects SET semester = ? WHERE subject_name = ?");
        return stmt.run(semester, subject_name);
    }
}

module.exports = SubjectsModel;