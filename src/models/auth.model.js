const db = require("../database/db");
class AuthModel {
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
    static deleteUser(id) {
        const stmt = db.prepare("DELETE FROM auth WHERE id = ?");
        return stmt.run(id);
    }
    static changeIsAdmin(id, is_admin) {
        const stmt = db.prepare("UPDATE auth SET is_admin = ? WHERE id = ?");
        return stmt.run(is_admin, id);
    }
    // Password Methods
    static findPasswordIsNotNull(id) {
        const stmt = db.prepare("SELECT password_hash FROM auth WHERE id = ? AND password_hash IS NOT NULL");
        return stmt.get(id);
    }
    static changePassword(id, new_password_hash) {
        const stmt = db.prepare("UPDATE auth SET password_hash = ? WHERE id = ?");
        return stmt.run(new_password_hash, id);
    }
    static changePasswordRequired(id, password_required) {
        const stmt = db.prepare("UPDATE auth SET password_required = ? WHERE id = ?");
        return stmt.run(password_required, id);
    }
    static findPasswordKey(id) {
        const stmt = db.prepare("SELECT * FROM password_key WHERE id = ?");
        return stmt.get(id);
    }
    static addPasswordKey(id, password_key_hash, created_at, expires_at) {
        const stmt = db.prepare("INSERT OR REPLACE INTO password_key (id, password_key_hash, created_at, expires_at) VALUES (?, ?, ?, ?)");
        return stmt.run(id, password_key_hash, created_at, expires_at);
    }
    // Refresh Token Methods
    static findRefreshToken(token_hash) {
        const stmt = db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ?");
        return stmt.get(token_hash);
    }
    static findRefreshTokenMatchDevice(token_hash, device_desc) {
        const stmt = db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ? AND device_desc = ?");
        return stmt.get(token_hash, device_desc);
    }
    static findRefreshTokensById(id) {
        const stmt = db.prepare("SELECT * FROM refresh_tokens WHERE id = ?");
        return stmt.all(id);
    }

    static addRefreshToken(id, user_type, token_hash, device_desc, created_at, expires_at) {
        const stmt = db.prepare("INSERT INTO refresh_tokens (id, user_type, token_hash, device_desc, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)");
        return stmt.run(id, user_type, token_hash, device_desc, created_at, expires_at);
    }
    static deleteRefreshToken(token_hash) {
        const stmt = db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?");
        return stmt.run(token_hash);
    }
    static deleteRefreshTokenMatchId(id, token_hash) {
        const stmt = db.prepare("DELETE FROM refresh_tokens WHERE id = ? AND token_hash = ?");
        return stmt.run(id, token_hash);
    }
    static deleteRefreshTokenAll(id){
        const stmt = db.prepare("DELETE FROM refresh_tokens WHERE id = ?");
        return stmt.run(id);
    }
}
module.exports = AuthModel;