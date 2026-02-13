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
    static updateAvatarName(id, avatar_name) {
        const stmt = db.prepare("UPDATE profiles SET avatar_name = ? WHERE id = ?");
        stmt.run(id, avatar_name);
    }
    static getAvatarName(id) {
        const stmt = db.prepare("SELECT avatar_name FROM profiles WHERE id = ?");
        return stmt.get(id);
    }
}
module.exports = ProfilesModel;