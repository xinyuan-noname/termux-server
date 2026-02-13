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
    static updateAvatarPath(id, avatar_path) {
        const stmt = db.prepare("UPDATE profiles SET avatar_path = ? WHERE id = ?");
        stmt.run(id, avatar_path);
    }
}
module.exports = ProfilesModel;