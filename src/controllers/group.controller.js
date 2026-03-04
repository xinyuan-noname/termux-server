const GroupService = require('../service/group.service');

class GroupController {
    getEntireGroup(req, res) {
        const entireGroup = GroupService.getEntireGroup();
        return res.json(entireGroup);
    }
    getAdminGroup(req, res) {
        const adminGroup = GroupService.getAdminGroup();
        return res.json(adminGroup);
    }

    getMaleGroup(req, res) {
        const maleGroup = GroupService.getMaleGroup();
        return res.json(maleGroup);

    }

    getFemaleGroup(req, res) {
        const femaleGroup = GroupService.getFemaleGroup();
        return res.json(femaleGroup);
    }

    getNoGenderGroup(req, res) {
        const noGenderGroup = GroupService.getNoGenderGroup();
        return res.json(noGenderGroup);
    }

    getHavePositionGroup(req, res) {
        const havePositionGroup = GroupService.getHavePositionGroup();
        return res.json(havePositionGroup);
    }

    getUserGroup(req, res) {
        const userGroup = GroupService.getUserGroup();
        res.json(userGroup);
    }
}

module.exports = new GroupController();