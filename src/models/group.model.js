const db = require("../database/db");

// group只关心该组里有哪些人
class GroupModel {
    static getEntireGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info");
        return stmt.all();
    }
    static  getAdminGroup() {
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE is_admin = 1");
        return stmt.all();
    }
    static getMaleGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE gender = 'male'");
        return stmt.all();
    }
    static getFemaleGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE gender = 'female'");
        return stmt.all();
    }
    static getNoGenderGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE gender IS NULL");
        return stmt.all();
    }
    static getHavePostionGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE position IS NOT NULL");
        return stmt.all();
    }
    static getNoPostionGroup(){
        const stmt = db.prepare("SELECT id, username FROM user_info WHERE position IS NULL");
        return stmt.all();
    }
}
module.exports = GroupModel;