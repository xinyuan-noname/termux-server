const GroupModel = require("../models/group.model");

class GroupServer {
    static getMaleGroup() {
        return GroupModel.getMaleGroup();
    }
    static getFemaleGroup() {
        return GroupModel.getFemaleGroup();
    }
    static getNoGenderGroup() {
        return GroupModel.getNoGenderGroup();
    }
    static getAdminGroup() {
        return GroupModel.getAdminGroup();
    }
    static getHavePositionGroup() {
        return GroupModel.getHavePostionGroup();
    }
    static getUserGroup() {
        return GroupModel.getNoPostionGroup();
    }
}
module.exports = GroupServer;