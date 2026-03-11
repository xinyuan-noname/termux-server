const { ValidationError, NotFoundError } = require("../error");
const SubjectsModel = require("../models/subjects.model");

class SubjectsService {
    static async createSubject({ subject_name, alias, teachers, courses, semester }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
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

        const existingSubject = SubjectsModel.getSubjectByName(subject_name);
        if (existingSubject) {
            throw new ValidationError("Subject already exists", "subject_name");
        }

        return SubjectsModel.createSubject(subject_name, alias, teachers, courses, semester);
    }

    static async getSubjectByName({ subject_name }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return subject;
    }

    static async getAllSubjects() {
        return SubjectsModel.getAllSubjects();
    }

    static async getSubjectsBySemester({ semester }) {
        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }

        return SubjectsModel.getSubjectsBySemester(semester);
    }

    static async updateSubject({ subject_name, alias, teachers, courses, semester }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
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

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.updateSubject(subject_name, alias, teachers, courses, semester);
    }

    static async deleteSubject({ subject_name }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.deleteSubject(subject_name);
    }

    static async updateSubjectTeachers({ subject_name, teachers }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        if (!Array.isArray(teachers)) {
            throw new ValidationError("Teachers must be an array", "teachers");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.updateSubjectTeachers(subject_name, teachers);
    }

    static async updateSubjectCourses({ subject_name, courses }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        if (!Array.isArray(courses)) {
            throw new ValidationError("Courses must be an array", "courses");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.updateSubjectCourses(subject_name, courses);
    }

    static async updateSubjectAlias({ subject_name, alias }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        if (alias != null && typeof alias !== "string") {
            throw new ValidationError("Invalid alias", "alias");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.updateSubjectAlias(subject_name, alias);
    }

    static async updateSubjectSemester({ subject_name, semester }) {
        if (!subject_name || typeof subject_name !== "string") {
            throw new ValidationError("Invalid subject name", "subject_name");
        }

        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }

        const subject = SubjectsModel.getSubjectByName(subject_name);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subject_name}`);
        }

        return SubjectsModel.updateSubjectSemester(subject_name, semester);
    }
}

module.exports = SubjectsService;