const { ValidationError, NotFoundError } = require("../error");
const SubjectsModel = require("../models/subjects.model");

class SubjectsService {

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
}

module.exports = SubjectsService;