const { ValidationError, NotFoundError } = require("../error");
const SubjectsModel = require("../models/subjects.model");

class SubjectsService {

    static getSubjectByName({ subjectName }) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }
        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }
        return SubjectsService.#parseSubject(subject);
    }

    static getSubjectsBySemester({ semester } = {}) {
        if (!semester || typeof semester !== "string") {
            throw new ValidationError("Invalid semester", "semester");
        }
        const list = SubjectsModel.getSubjectsBySemester(semester);
        return list.map(subject => SubjectsService.#parseSubject(subject))
    }


    static deleteSubject({ subjectName } = {}) {
        if (!subjectName || typeof subjectName !== "string") {
            throw new ValidationError("Invalid subject name", "subjectName");
        }

        const subject = SubjectsModel.getSubjectByName(subjectName);
        if (!subject) {
            throw new NotFoundError(`Subject not found: ${subjectName}`);
        }

        return SubjectsModel.deleteSubject(subjectName);
    }
    static #parseSubject(subject) {
        const { subject_name, course_type, teachers, schedule, ...keys } = subject;
        return {
            subjectName: subject_name,
            courseType: course_type,
            teachers: JSON.parse(teachers),
            schedule: SubjectsService.#parseSchedule(schedule),
            ...keys
        }
    }
    static #parseSchedule(schedule) {
        const items = JSON.parse(schedule);
        if (!Array.isArray(items)) return [];
        if (!items.length) return [];
        const result = [];
        for (const item of items) {
            const { period, weeks, weekday, location, biweekly = 0 } = item;
            const expandedWeeks = [];
            const parsedPeriod = JSON.parse(period);
            const parsedWeeks = JSON.parse(weeks);
            for (const week of parsedWeeks) {
                if (typeof week === "number") {
                    expandedWeeks.push(week);
                    continue;
                }
                if (typeof week === "string") {
                    const [startStr, endStr] = week.trim().split("-");
                    const start = parseInt(startStr);
                    const end = parseInt(endStr);
                    console.log(week, startStr, endStr, start, end)
                    if (!isFinite(start) || !isFinite(end)) continue;
                    for (let i = start; i <= end; i++) {
                        expandedWeeks.push(i);
                    }
                }
            }
            result.push({ weekday, period: parsedPeriod, weeks: expandedWeeks.filter(week => biweekly === 1 ? week % 2 == 0 : true), location });
        }
        return result;
    }
}

module.exports = SubjectsService;