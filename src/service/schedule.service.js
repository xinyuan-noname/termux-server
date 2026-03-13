const ScheduleModel = require("../models/schedule.model");

class ScheduleService {
    static getScheduleBySemester({ semester } = {}) {
        const list = ScheduleModel.getScheduleBySemester(semester);
        return list.map((item) => {
            const { is_experiement, ...keys } = item;
            return {
                isExperiement: is_experiement,
                ...keys
            }
        })
    }
}
module.exports = ScheduleService;