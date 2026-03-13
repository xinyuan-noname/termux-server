const { ValidationError, NotFoundError } = require("../error");
const logger = require("../logger");
const SemestersModel = require("../models/semesters");

class SemestersService {
    static createSemester({ semesterName, startedAt, phaseList } = {}) {
        if (!semesterName || typeof semesterName !== "string") {
            throw new ValidationError("Invalid semester name", "semesterName");
        }

        if (!startedAt || typeof startedAt !== "string") {
            throw new ValidationError("Invalid start date", "startedAt");
        }

        if (!Array.isArray(phaseList)) {
            throw new ValidationError("Phase list must be an array", "phaseList");
        }

        const existingSemester = SemestersModel.findSemesterByName(semesterName);
        if (existingSemester) {
            throw new ValidationError("Semester already exists", "semesterName");
        }

        SemestersModel.createSemester(semesterName, startedAt, phaseList);
    }

    static getSemesterByName({ semesterName } = {}) {
        if (!semesterName || typeof semesterName !== "string") {
            throw new ValidationError("Invalid semester name", "semesterName");
        }

        const semester = SemestersModel.findSemesterByName(semesterName);
        if (!semester) {
            throw new NotFoundError(`未找到学期: ${semesterName}`);
        }

        const result = {
            semesterName: semester.semester_name,
            startedAt: semester.started_at,
            phaseList: semester.phase_list
        };

        if (result.phaseList && typeof result.phaseList === 'string') {
            try {
                result.phaseList = JSON.parse(result.phaseList);
            } catch (e) {
                logger.warn(e);
                result.phaseList = [];
            }
        }

        return result;
    }

    static getAllSemesters() {
        const semesters = SemestersModel.findAllSemesters();

        return semesters.map(semester => {
            const result = {
                semesterName: semester.semester_name,
                startedAt: semester.started_at,
                phaseList: semester.phase_list
            };

            if (result.phaseList && typeof result.phaseList === 'string') {
                try {
                    result.phaseList = JSON.parse(result.phaseList);
                } catch (e) {
                    logger.warn(e);
                    result.phaseList = [];
                }
            }

            return result;
        });
    }

    static updateSemester({ semesterName, startedAt, phaseList } = {}) {
        if (!semesterName || typeof semesterName !== "string") {
            throw new ValidationError("Invalid semester name", "semesterName");
        }

        if (startedAt != null && typeof startedAt !== "string") {
            throw new ValidationError("Invalid start date", "startedAt");
        }

        if (phaseList != null && !Array.isArray(phaseList)) {
            throw new ValidationError("Phase list must be an array", "phaseList");
        }

        const semester = SemestersModel.findSemesterByName(semesterName);
        if (!semester) {
            throw new NotFoundError(`未找到学期: ${semesterName}`);
        }

        SemestersModel.updateSemester(semesterName, startedAt, phaseList);
    }

    static deleteSemester({ semesterName } = {}) {
        if (!semesterName || typeof semesterName !== "string") {
            throw new ValidationError("Invalid semester name", "semesterName");
        }
        SemestersModel.deleteSemester(semesterName);
    }

    static getCurrentSemester() {
        const semester = SemestersModel.getCurrentSemester();
        if (!semester) {
            throw new NotFoundError("暂无最新的学期");
        }
        const result = {
            semesterName: semester.semester_name,
            startedAt: semester.started_at,
            phaseList: semester.phase_list
        };

        if (result.phaseList && typeof result.phaseList === 'string') {
            try {
                result.phaseList = JSON.parse(result.phaseList);
            } catch (e) {
                logger.warn(e);
                result.phaseList = [];
            }
        }

        return result;
    }
}

module.exports = SemestersService;