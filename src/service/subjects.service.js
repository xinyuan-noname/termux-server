const { ValidationError, NotFoundError } = require("../error");
const SubjectsModel = require("../models/subjects.model");

class SubjectsService {
    static async createSubject({ subjectName, alias, teachers, courses, semester }) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (alias != null && typeof alias !== "string") {
            throw new ValidationError("Invalid alias", "alias");
        }

        if (!Array.isArray(teachers)) {
            throw new ValidationError("Teachers must be an array", "teachers");
        }

        if (!Array.isArray(courses)) {
            throw new ValidationError("Courses must be an array", "courses");
        }

        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }

        const existingSubject = SubjectsModel.getSubjectByName(subjectName);
        if (existingSubject) {
            throw new ValidationError("Subject already exists", "subjectName");
        }

        return SubjectsModel.createSubject(subjectName, alias, teachers, courses, semester);
    }

    static async getSubjectByName({ subjectName }) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }
        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }
        const { subject_name, ...keys } = subject;
        return { subject_name, ...keys };
    }

    static async getAllSubjects() {
        const subjectList = SubjectsModel.getAllSubjects();
        return subjectList.map((subject) => {
            const { subject_name, ...keys } = subject;
            return { subject_name, ...keys };
        });
    }

    static async getSubjectsBySemester({ semester } = {}) {
        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }
        const { subject_name, ...keys } = SubjectsModel.getSubjectsBySemester(semester);
        return { subjectName: subject_name, ...keys }
    }

    static async updateSubject({ subjectName, alias, teachers, courses, semester } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (alias != null && typeof alias !== "string") {
            throw new ValidationError("Invalid alias", "alias");
        }

        if (teachers != null && !Array.isArray(teachers)) {
            throw new ValidationError("Teachers must be an array", "teachers");
        }

        if (courses != null && !Array.isArray(courses)) {
            throw new ValidationError("Courses must be an array", "courses");
        }

        if (semester != null && typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.updateSubject(subjectName, alias, teachers, courses, semester);
    }

    static async deleteSubject({ subjectName } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.deleteSubject(subjectName);
    }

    static async updateSubjectTeachers({ subjectName, teachers } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (!Array.isArray(teachers)) {
            throw new ValidationError("Teachers must be an array", "teachers");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.updateSubjectTeachers(subjectName, teachers);
    }

    static async updateSubjectCourses({ subjectName, courses } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (!Array.isArray(courses)) {
            throw new ValidationError("Courses must be an array", "courses");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.updateSubjectCourses(subjectName, courses);
    }

    static async updateSubjectAlias({ subjectName, alias } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (alias != null && typeof alias !== "string") {
            throw new ValidationError("Invalid alias", "alias");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.updateSubjectAlias(subjectName, alias);
    }

    static async updateSubjectSemester({ subjectName, semester } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.updateSubjectSemester(subjectName, semester);
    }
}

module.exports = SubjectsService;