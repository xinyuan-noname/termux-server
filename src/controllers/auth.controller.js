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
            await AuthService.createUserBySignature({ id, username, password, passwordRequired, isAdmin, signature, createdAt })
        } else if (payload?.userType === "admin") {
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
        const payload = AuthService.verifyAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                try {
                    await AuthService.createUser(user);
                    result.push(formatRegisterResult(user));
                } catch (error) {
                    logger.error(`注册时,token校验失败,来自${payload.id}`, error)
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                const error = new UnauthorizedError()
                result.push(formatRegisterResult(user, error))
                logger.error(`注册时,token校验失败,来源未知`, error);
            })
        }
        for (const user of bySignature) {
            try {
                await AuthService.createUserBySignature(user);
                result.push(formatRegisterResult(user))
            } catch (error) {
                logger.error(`注册时,签名校验失败`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static delete(req, res) {
        const { id, signature, createdAt } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        if (signature) {
            AuthService.deleteUserBySignature({ id, signature, createdAt });
        } else if (payload?.userType === "admin" && AuthService.isAdmin(id)) {
            AuthService.deleteUser({ id });
        } else {
            throw new UnauthorizedError()
        }
        return res.end();
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
        const payload = AuthService.verifyAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                if (!AuthService.isAdmin(user.id)) {
                    const error = new UnauthorizedError()
                    logger.error(`尝试删除管理员账户,来自${payload.id}`, error);
                    result.push(formatRegisterResult(user, error))
                    continue;
                }
                try {
                    AuthService.deleteUser(user);
                    result.push(formatRegisterResult(user))
                } catch (error) {
                    logger.error(`删除账户时,token校验失败,来自${payload.id}`, error);
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                const error = new UnauthorizedError()
                logger.error(`删除账户时,token校验失败,来源未知`, error);
                result.push(formatRegisterResult(user, error))
            })
        }
        for (const user of bySignature) {
            try {
                AuthService.deleteUserBySignature(user);
                result.push(formatRegisterResult(user))
            } catch (error) {
                logger.error(`删除账户时,签名校验失败`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static changePassword(req, res) {
        const { id, passwordKey, newPassword } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        if (!payload || payload.id !== id) {
            throw new UnauthorizedError();
        }
        AuthService.changePassword({ id, passwordKey, newPassword });
        return res.status(204).end();
    }
    static changePasswordRequired(req, res) {
        const { id, passwordRequired } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        if (!payload || payload.id !== id) {
            throw new UnauthorizedError();
        }
        AuthService.changePasswordRequired({ id, passwordRequired });
        return res.status(204).end();
    }
    static changeAdminStatus(req, res) {
        const { id, isAdmin, signature, createdAt } = req.body;
        AuthService.changeAdminStatus({ id, isAdmin, signature, createdAt });
        return res.status(204).end();
    }
}
module.exports = AuthController