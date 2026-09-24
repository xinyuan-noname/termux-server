const ScheduleModel = require("../models/schedule.model");

class ScheduleService {
    static getScheduleBySemester({ semester } = {}) {
        const list = ScheduleModel.getScheduleBySemester(semester);
        return list.map((item) => {
            
            const { is_experiment, ...keys } = item;
            return {
                isExperiment: is_experiment == 1,
                ...keys
            }
        })
    }
}
module.exports = ScheduleService;