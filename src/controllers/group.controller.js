const GroupService = require('../service/group.service');

class GroupController {
    getAdminGroup(req, res) {
        const adminGroup = GroupService.getAdminGroup();
        res.json(adminGroup);
    }

    getMaleGroup(req, res) {
        const maleGroup = GroupService.getMaleGroup();
        res.json(maleGroup);

    }

    getFemaleGroup(req, res) {
        const femaleGroup = GroupService.getFemaleGroup();
        res.json(femaleGroup);
    }

    getNoGenderGroup(req, res) {
        const noGenderGroup = GroupService.getNoGenderGroup();
        res.json(noGenderGroup);
    }

    getHavePositionGroup(req, res) {
        const havePositionGroup = GroupService.getHavePositionGroup();
        res.json(havePositionGroup);
    }

    getUserGroup(req, res) {
        const userGroup = GroupService.getUserGroup();
        res.json(userGroup);
    }
}

module.exports = new GroupController();