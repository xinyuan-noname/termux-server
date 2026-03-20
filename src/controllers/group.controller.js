const GroupService = require('../service/group.service');

class GroupController {
    static getEntireGroup(req, res) {
        const entireGroup = GroupService.getEntireGroup();
        return res.json(entireGroup);
    }
    static getAdminGroup(req, res) {
        const adminGroup = GroupService.getAdminGroup();
        return res.json(adminGroup);
    }

    static getMaleGroup(req, res) {
        const maleGroup = GroupService.getMaleGroup();
        return res.json(maleGroup);
    }

    static getFemaleGroup(req, res) {
        const femaleGroup = GroupService.getFemaleGroup();
        return res.json(femaleGroup);
    }

    static getNoGenderGroup(req, res) {
        const noGenderGroup = GroupService.getNoGenderGroup();
        return res.json(noGenderGroup);
    }

    static getHavePositionGroup(req, res) {
        const havePositionGroup = GroupService.getHavePositionGroup();
        return res.json(havePositionGroup);
    }

    static getUserGroup(req, res) {
        const userGroup = GroupService.getUserGroup();
        res.json(userGroup);
    }
}

module.exports = GroupController;