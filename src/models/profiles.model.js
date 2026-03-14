const db = require("../database/db");

class ProfilesModel {
    static createProfile(id) {
        const stmt = db.prepare("INSERT INTO profiles (id) VALUES (?)");
        stmt.run(id);
    }
    static updateGender(id, gender) {
        const stmt = db.prepare("UPDATE profiles SET gender = ? WHERE id = ?");
        stmt.run(gender, id);
    }
    static updatePosition(id, position) {
        const stmt = db.prepare("UPDATE profiles SET position = ? WHERE id = ?");
        stmt.run(position, id);
    }
    static updateAvatarName(id, avatar_name) {
        const stmt = db.prepare("UPDATE profiles SET avatar_name = ? WHERE id = ?");
        stmt.run(avatar_name, id);
    }
    static updateMajor(id, major) {
        const stmt = db.prepare("UPDATE profiles SET major = ? WHERE id = ?");
        stmt.run(major, id);
    }
    static updateClass(id, $class) {
        const stmt = db.prepare("UPDATE profiles SET class = ? WHERE id = ?");
        stmt.run($class, id);
    }
    static getAvatarName(id) {
        const stmt = db.prepare("SELECT avatar_name FROM profiles WHERE id = ?");
        return stmt.get(id);
    }
    static getUserInfo(id) {
        const stmt = db.prepare("SELECT * FROM user_info WHERE id = ?");
        return stmt.get(id);
    }
    static getAllUserInfo() {
        const stmt = db.prepare("SELECT * FROM user_info");
        return stmt.all();
    }
    static getAllAdminInfo() {
        const stmt = db.prepare("SELECT * FROM user_info WHERE is_admin = 1");
        return stmt.all();
    }
}
module.exports = ProfilesModel;