const db = require("../database/db");
class AuthModel {
    static isAdmin(id) {
        const stmt = db.prepare("SELECT is_admin FROM auth WHERE id = ?")
        return stmt.get(id);
    }
    static findUser(id) {
        const stmt = db.prepare("SELECT * FROM auth WHERE id = ?");
        return stmt.get(id);
    }
    static findUserByIdAndUsername(id, username) {
        const stmt = db.prepare("SELECT * FROM auth WHERE id = ? AND username = ?");
        return stmt.get(id, username);
    }
    static createUser(id, username, password_hash, password_required = 0, is_admin = 0) {
        const stmt = db.prepare("INSERT INTO auth (id, username, password_hash, password_required, is_admin) VALUES (?, ?, ?, ?, ?)");
        return stmt.run(id, username, password_hash, password_required, is_admin);
    }
    static addRefreshToken(id, refresh_hash, created_at, expires_at) {
        const stmt = db.prepare("INSERT INTO refresh_token (id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)");
        return stmt.run(id, refresh_hash, created_at, expires_at);
    }
}
module.exports = AuthModel;