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
    static findRefreshToken(token_hash) {
        const stmt = db.prepare("SELECT * FROM refresh_token WHERE token_hash = ?");
        return stmt.get(token_hash);
    }
    static addRefreshToken(id, user_type, token_hash, created_at, expires_at) {
        const stmt = db.prepare("INSERT INTO refresh_token (id, user_type, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)");
        return stmt.run(id, user_type, token_hash, created_at, expires_at);
    }
    static deleteRefreshToken(token_hash) {
        const stmt = db.prepare("DELETE FROM refresh_token WHERE token_hash = ?");
        return stmt.run(token_hash);
    }
    static truncRefreshToken(id, limit) {
        const stmt = db.prepare("DELETE FROM refresh_token WHERE id = ? AND rowid NOT IN (SELECT rowid FROM refresh_token WHERE id = ? ORDER BY created_at DESC LIMIT ?)")
        return stmt.run(id, id, limit);
    }
}
module.exports = AuthModel;