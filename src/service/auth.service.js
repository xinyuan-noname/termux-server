const AuthModel = require("../models/auth.model");
const bcrypt = require("@node-rs/bcrypt");
const authConfig = require("../../config/auth");
const { ValidationError, UnauthorizedError, ConflictError, TokenIssueError } = require("../error");
const { verifyRSASignature, verifyJWT, signJWT, decodeJWT, generateRandomSafeString, convertToHash } = require("../utils/verification");
const { isUnsignedIntegerString, isCnNameString, isExpired } = require("../utils/validation");
const logger = require("../logger");
const bannedAccessToken = {
    map: new Map(),
    add(token) {
        const { jti, exp, iat } = decodeJWT(token);
        if (this.map.has(jti)) return this;
        const delta = exp - iat;
        setTimeout(() => this.map.delete(jti), delta * 1000 + 500);
        this.map.set(jti, exp);
        return this;
    },
    has(jti) {
        return this.map.has(jti);
    }
}
const checkPasswordValidation = (password) => {
    if (password.length < authConfig.PASSWORD_MIN_LENGTH) {
        throw new ValidationError(`Password must be at least ${authConfig.PASSWORD_MIN_LENGTH} characters long.`, "password");
    }
    if (password.length > authConfig.PASSWORD_MAX_LENGTH) {
        throw new ValidationError(`Password must be at most ${authConfig.PASSWORD_MAX_LENGTH} characters long.`, "password");
    }
}
class AuthService {
    static isAdmin(id) {
        try {
            const user = AuthModel.findUser(id);
            return user.is_admin === 1;
        } catch {
            return false;
        }
    }
    static issueAccessToken(payload) {
        try {
            return signJWT(payload, {
                expiresIn: authConfig.ACCESS_TOKEN_AGE,
                jwtid: generateRandomSafeString()
            })
        } catch {
            throw new TokenIssueError()
        }
    }
    static verifyAccessToken(token) {
        if (!token) return null;
        const payload = verifyJWT(token);
        if (!payload) return null;
        if (bannedAccessToken.has(payload.jti)) return null;
        return payload;
    }
    static revokeAccessToken(token) {
        if (!token) return null;
        bannedAccessToken.add(token);
    }
    static issueRefreshToken({ id, deviceDescription = "Unknow Device", userType = "guest" } = {}) {
        try {
            if (!isUnsignedIntegerString(id)) {
                throw new Error("Invalid ID.");
            }
            const user = AuthModel.findUser(id);
            if (!user) {
                throw new Error("Cannot find user.");
            }
            if (!authConfig.USER_TYPE_LIST.includes(userType)) {
                throw new Error("Invalid user type.")
            }
            const token = generateRandomSafeString(64);
            const tokenHash = convertToHash(token);
            const createdAt = Math.ceil(Date.now() / 1000);
            const expiresAt = createdAt + authConfig.REFRESH_TOKEN_AGE;
            AuthModel.addRefreshToken(id, userType, tokenHash, deviceDescription, createdAt, expiresAt);
            return { refreshToken: token };
        } catch {
            throw new TokenIssueError()
        }
    }
    static verifyRefreshToken(token, deviceDescription = "Unknow Device") {
        if (typeof token !== "string") {
            throw new UnauthorizedError();
        }
        const tokenHash = convertToHash(token);
        const result = AuthModel.findRefreshTokenMatchDevice(tokenHash, deviceDescription);
        if (!result) {
            throw new UnauthorizedError();
        }
        if (result.expires_at < Math.ceil(Date.now() / 1000)) {
            logger.info(`Refresh token expired for user ID ${result.id}`);
            throw new UnauthorizedError();
        }
        return { id: result.id, userType: result.userType };
    }
    static revokeRefreshToken(token) {
        const tokenHash = convertToHash(token);
        AuthModel.deleteRefreshToken(tokenHash);
        return {}
    }
    static async verifyCredentials({ id, username, password } = {}) {
        if (!isUnsignedIntegerString(id) || !isCnNameString(username)) {
            throw new ValidationError("Invalid user ID or username", "id/username");
        }
        const user = AuthModel.findUserByIdAndUsername(id, username);
        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }
        if (user.password_required === 0 && (password == null || password === "")) {
            return { userType: "guest" };
        }
        if (typeof password !== "string") {
            throw new UnauthorizedError("Invalid credentials");
        }
        const passwordMatch = await bcrypt.compare(password.normalize("NFC"), user.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedError("Invalid credentials");
        }
        return { userType: user.is_admin === 1 ? "admin" : "user" };
    }
    static async createUser({ id, username, password, passwordRequired = 0 } = {}) {
        if (!isUnsignedIntegerString(id) || !isCnNameString(username)) {
            throw new ValidationError("Invalid user ID or username", "id/username");
        }
        if (![0, 1].includes(passwordRequired)) {
            throw new ValidationError("Invalid password required value", "passwordRequired")
        }

        if (passwordRequired === 1 && typeof password !== "string") {
            throw new ValidationError("Password is required but not provided.", "password");
        }

        if (typeof password === 'string') {
            if (password.length < authConfig.PASSWORD_MIN_LENGTH) {
                throw new ValidationError(`Password must be at least ${authConfig.PASSWORD_MIN_LENGTH} characters long.`, "password");
            }
            if (password.length > authConfig.PASSWORD_MAX_LENGTH) {
                throw new ValidationError(`Password must be at most ${authConfig.PASSWORD_MAX_LENGTH} characters long.`, "password");
            }
        }
        const passwordHash = typeof password === "string" ? await bcrypt.hash(password.normalize("NFC"), 10) : null,
            isAdmin = 0;
        try {
            AuthModel.createUser(id, username, passwordHash, passwordRequired, isAdmin);
            return {};
        } catch (err) {
            if (err.message?.includes("UNIQUE constraint failed")) {
                throw new ConflictError("User already exists", "id");
            }
            throw err;
        }
    }
    static async createUserBySignature({ id, username, password, passwordRequired = 0, isAdmin = 0, signature, createdAt } = {}) {
        if (isExpired(createdAt, authConfig.REGISTRATION_SIGNATURE_AGE)) {
            throw new ValidationError("Expired signature", "signature")
        }

        if (![0, 1].includes(passwordRequired)) {
            throw new ValidationError("Invalid password required value", "password_required")
        }
        if (![0, 1].includes(isAdmin)) {
            throw new ValidationError("Invalid password required value", "is_admin")
        }

        if (!isUnsignedIntegerString(id) || !isCnNameString(username)) {
            throw new ValidationError("Invalid user ID or username", "id/username");
        }

        if ((isAdmin === 1 || passwordRequired === 1) && typeof password !== "string") {
            throw new ValidationError("Password is required but not provided.", "password");
        }
        if (typeof password === 'string') {
            checkPasswordValidation(password);
        }
        if (!verifyRSASignature(`${id}|${username}|${isAdmin}|${createdAt}`, signature)) {
            throw new UnauthorizedError("Invalid or tampered signature");
        }
        const passwordHash = typeof password === "string" ? await bcrypt.hash(password.normalize("NFC"), 10) : null;
        try {
            AuthModel.createUser(id, username, passwordHash, passwordRequired, isAdmin);
            return {};
        } catch (err) {
            if (err.message?.includes("UNIQUE constraint failed")) {
                throw new ConflictError("User already exists", "id");
            }
            throw err;
        }
    }
    static deleteUser({ id } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new UnauthorizedError();
        }
        try {
            AuthModel.deleteUser(id);
            return {};
        } catch {
            throw new UnauthorizedError();
        }
    }
    static deleteUserBySignature({ id, signature, createdAt } = {}) {
        if (isExpired(createdAt, authConfig.REGISTRATION_SIGNATURE_AGE)) {
            throw new UnauthorizedError();
        }
        if (!isUnsignedIntegerString(id)) {
            throw new UnauthorizedError();
        }
        if (!verifyRSASignature(`${id}|${createdAt}`, signature)) {
            throw new UnauthorizedError();
        }
        try {
            AuthModel.deleteUser(id);
            return {};
        } catch {
            throw new UnauthorizedError();
        }
    }
    static async changePassword({ id, passwordKey, newPassword } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("Invalid user ID", "id");
        }
        const resultPasswordKey = AuthModel.findPasswordKey(id);
        if (!resultPasswordKey) {
            throw new UnauthorizedError("Cannot find password key.");
        } else {
            const { password_key_hash, expires_at } = resultPasswordKey;
            if (expires_at < Math.ceil(Date.now() / 1000)) {
                throw new UnauthorizedError("Password key expired.");
            }
            if (await bcrypt.compare(passwordKey.normalize("NFC"), password_key_hash)) {
                throw new UnauthorizedError("Invalid password key.");
            };
        }
        if (typeof newPassword !== "string") {
            throw new ValidationError("Invalid new password.", "newPassword");
        }
        checkPasswordValidation(newPassword);
        const newPasswordHash = await bcrypt.hash(newPassword.normalize("NFC"), 10);
        AuthModel.changePassword(id, newPasswordHash);
        return {};
    }
    static changePasswordRequired({ id, passwordRequired } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("Invalid user ID", "id");
        }
        if (![0, 1].includes(passwordRequired)) {
            throw new ValidationError("Invalid password required value", "passwordRequired")
        }
        if (passwordRequired === 1) {
            const result = AuthModel.findPasswordIsNotNull(id);
            if (!result) {
                throw new ValidationError("Cannot set password required when password is not set.", "passwordRequired");
            }
        }
        AuthModel.changePasswordRequired(id, passwordRequired);
    }
}
module.exports = AuthService;