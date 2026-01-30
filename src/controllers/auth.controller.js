const { UnauthorizedError, ValidationError } = require("../error");
const { getAccessTokenFromReq } = require("../utils/verification");
const AuthService = require("../service/auth.service");
const authConfig = require("../../config/auth");
const logger = require("../logger");
const formatRegisterResult = (user, error) => {
    return error ? {
        success: false,
        id: user.id || null,
        username: user.username || null,
        error: { message: error.message, code: error.code, field: error.field || null }
    } : {
        success: true,
        id: user.id,
        username: user.username,
    }
}

class AuthController {
    /**
     * POST auth/login
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async login(req, res) {
        const deviceDescription = req.deviceDescription;
        const { id, username, password } = req.body;
        const result = await AuthService.verifyCredentials({ id, username, password });
        const payload = { id, userType: result.userType };
        const accessToken = AuthService.issueAccessToken(payload);
        const { refreshToken } = AuthService.issueRefreshToken({ id, userType: result.userType, deviceDescription });
        switch (true) {
            default: {
                res.cookie('refreshToken', refreshToken, {
                    ...authConfig.REFRESH_TOKEN_COOKIE_OPTIONS,
                    maxAge: authConfig.REFRESH_TOKEN_AGE * 1000
                })
            }; break;
        }
        return res.json({ accessToken });
    }
    /**
     * POST auth/login
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static logout(req, res) {
        let refreshToken;
        const accessToken = getAccessTokenFromReq(req);
        if (accessToken) AuthService.revokeAccessToken(accessToken);
        switch (true) {
            default: {
                refreshToken = req.cookies.refreshToken;
                res.clearCookie('refreshToken', authConfig.REFRESH_TOKEN_COOKIE_OPTIONS);
            }; break;
        }
        if (refreshToken) {
            AuthService.revokeRefreshToken(refreshToken);
        }
        return res.status(204).end();
    }
    /**
     * DELETE auth/refresh
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async refresh(req, res) {
        const deviceDescription = req.deviceDescription;
        let refreshToken;
        switch (true) {
            default: {
                refreshToken = req.cookies.refreshToken;
            }; break;
        }
        const { id, userType } = AuthService.verifyRefreshToken(refreshToken, deviceDescription);
        const accessToken = AuthService.issueAccessToken({ id, userType });
        return res.json({ accessToken });
    }
    /**
     * POST auth/register
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async register(req, res) {
        const { id, username, password, passwordRequired, isAdmin, signature, createdAt } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        if (signature) {
            AuthService.verifyRSASignature([id, username, isAdmin], createdAt, signature)
            await AuthService.createUser({ id, username, password, passwordRequired })
        } else if (payload.userType === "admin") {
            await AuthService.createUser({ id, username, password, passwordRequired })
        } else {
            throw new UnauthorizedError()
        }
        return res.json(formatRegisterResult({ id, username }));
    }
    /**
     * POST auth/register/batch
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async registerBatch(req, res) {
        const { userList } = req.body;
        if (!Array.isArray(userList)) {
            throw new ValidationError("Invalid userList, expected userList to be an array", "userList")
        }
        if (userList.length > 30) {
            throw new ValidationError("Batch registration is limited to 30 users per request.", "userList")
        }
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.checkAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                try {
                    await AuthService.createUser(user);
                    result.push(formatRegisterResult(user));
                } catch (error) {
                    logger.warn(`注册时,token校验失败,来自${payload.id}`)
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                logger.warn(`注册时,token校验失败,来源${payload?.id || "未知"}`);
                result.push(formatRegisterResult(user, new UnauthorizedError()))
            })
        }
        for (const user of bySignature) {
            try {
                const { id, username, isAdmin, createdAt, signature } = user
                AuthService.verifyRSASignature([id, username, isAdmin], createdAt, signature);
                await AuthService.createUser(user);
                result.push(formatRegisterResult(user))
            } catch (error) {
                logger.warn(`注册时,签名校验失败`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static delete(req, res) {
        const { id, signature, createdAt } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.checkAccessToken(token);
        if (signature) {
            AuthService.verifyRSASignature([id], createdAt, signature);
            AuthService.deleteUser({ id });
        } else if (payload?.userType === "admin" && !AuthService.isAdmin(payload?.id)) {
            AuthService.deleteUser({ id });
        } else {
            throw new UnauthorizedError()
        }
        return res.status(204).end();
    }
    static deleteBatch(req, res) {
        const { userList } = req.body;
        if (!Array.isArray(userList)) {
            throw new ValidationError("Invalid userList, expected userList to be an array", "userList")
        }
        if (userList.length > 30) {
            throw new ValidationError("Batch deletion is limited to 30 users per request.", "userList")
        }
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.checkAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                if (!AuthService.isAdmin(user.id)) {
                    const error = new UnauthorizedError()
                    logger.warn(`尝试删除管理员账户,来自${payload.id}`, error);
                    result.push(formatRegisterResult(user, error))
                    continue;
                }
                try {
                    AuthService.deleteUser(user);
                    result.push(formatRegisterResult(user))
                } catch (error) {
                    logger.warn(`删除账户时,token校验失败,来自${payload.id}`, error);
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                const error = new UnauthorizedError()
                logger.warn(`删除账户时,token校验失败,来源${payload?.id || "未知"}`, error);
                result.push(formatRegisterResult(user, error))
            })
        }
        for (const user of bySignature) {
            try {
                const { id, createdAt, signature } = user
                AuthService.verifyRSASignature([id], createdAt, signature)
                AuthService.deleteUser(user);
                result.push(formatRegisterResult(user))
            } catch (error) {
                logger.error(`删除账户时,签名校验失败`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static issuePasswordKey(req, res) {
        const { id, createdAt, signature } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.checkAccessToken(token);
        let passwordKey;
        if (signature) {
            AuthService.verifyRSASignature([id], createdAt, signature)
            passwordKey = AuthService.issuePasswordKey({ id });
        } else if (!AuthService.isAdmin(payload?.id)) {
            passwordKey = AuthService.issuePasswordKey({ id });
        }
        if (!passwordKey) {
            return res.json({ passwordKey });
        } else {
            throw new UnauthorizedError()
        }
    }
    static changePassword(req, res) {
        const { passwordKey, newPassword } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        const { id } = payload;
        AuthService.changePassword({ id, passwordKey, newPassword });
        return res.status(204).end();
    }
    static changePasswordRequired(req, res) {
        const { passwordRequired } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        const { id } = payload;
        AuthService.changePasswordRequired({ id, passwordRequired });
        return res.status(204).end();
    }
    static changeAdminStatus(req, res) {
        const { id, isAdmin, signature, createdAt } = req.body;
        AuthService.verifyRSASignature([id, isAdmin], createdAt, signature)
        AuthService.changeAdminStatus({ id, isAdmin });
        return res.status(204).end();
    }
}
module.exports = AuthController