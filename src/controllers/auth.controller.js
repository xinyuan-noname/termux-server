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
        logger.info(`用户${id}登录成功, 签发访问令牌和刷新令牌`);
        return res.json({ accessToken });
    }
    /**
     * POST auth/login
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async logout(req, res) {
        let refreshToken;
        const accessToken = getAccessTokenFromReq(req);
        const payload = await AuthService.verifyAccessToken(accessToken);
        switch (true) {
            default: {
                refreshToken = req.cookies.refreshToken;
                res.clearCookie('refreshToken', authConfig.REFRESH_TOKEN_COOKIE_OPTIONS);
            }; break;
        }
        if (payload.id && refreshToken) {
            await AuthService.revokeAccessToken(accessToken);
            AuthService.revokeRefreshToken(payload.id, refreshToken);
        }
        logger.info(`用户${payload.id}从${req.deviceDescription}登出成功, 废止访问令牌`);
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
        logger.info(`用户${id}刷新访问令牌`);
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
        const payload = await AuthService.verifyAccessToken(token);
        if (signature) {
            AuthService.verifyRSASignature([id, username, isAdmin], createdAt, signature)
            await AuthService.createUser({ id, username, password, passwordRequired })
            logger.info(`用户${id}注册成功, 来自:${authConfig.SIGNATURE_USER_ID}`);
        } else if (payload.userType === "admin") {
            await AuthService.createUser({ id, username, password, passwordRequired })
            logger.info(`用户${id}注册成功, 来自:${payload.id}`);
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
        if (userList.length > authConfig.ADDITION_USER_MAX_LENGTH) {
            throw new ValidationError(`Batch registration is limited to ${authConfig.ADDITION_USER_MAX_LENGTH} users per request.`, "userList")
        }
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.useAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = [];
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                try {
                    await AuthService.createUser(user);
                    result.push(formatRegisterResult(user));
                    logger.info(`注册用户${user?.id}成功, 来自:${payload?.id}`);
                } catch (error) {
                    logger.warn(`注册用户${user.id}时,校验失败,来自${payload?.id}`, error)
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                const error = new UnauthorizedError()
                logger.warn(`注册用户${user?.id}时, 校验失败, 来自:${payload?.id || authConfig.UNKNOWN_USER_ID}`, error);
                result.push(formatRegisterResult(user, error))
            })
        }
        for (const user of bySignature) {
            try {
                const { id, username, isAdmin, createdAt, signature } = user
                AuthService.verifyRSASignature([id, username, isAdmin], createdAt, signature);
                await AuthService.createUser(user);
                result.push(formatRegisterResult(user))
                logger.info(`注册用户${id}成功,来自:${authConfig.SIGNATURE_USER_ID}`);
            } catch (error) {
                logger.warn(`注册用户${user.id}时, 校验失败, 来自:${authConfig.SIGNATURE_USER_ID}`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static async delete(req, res) {
        const { id, signature, createdAt } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.useAccessToken(token);
        if (signature) {
            AuthService.verifyRSASignature([id], createdAt, signature);
            AuthService.deleteUser({ id });
        } else if (payload?.userType === "admin" && !AuthService.isAdmin(payload?.id)) {
            AuthService.deleteUser({ id });
        } else {
            const error = new UnauthorizedError()
            logger.warn(`删除用户时, 校验失败, 来自:${signature ?
                authConfig.SIGNATURE_USER_ID :
                payload?.id || authConfig.UNKNOWN_USER_ID}`, error);
        }
        return res.status(204).end();
    }
    static async deleteBatch(req, res) {
        const { userList } = req.body;
        if (!Array.isArray(userList)) {
            throw new ValidationError("Invalid userList, expected userList to be an array", "userList")
        }
        if (userList.length > authConfig.DELETION_USER_MAX_LENGTH) {
            throw new ValidationError(`Batch deletion is limited to ${authConfig.DELETION_USER_MAX_LENGTH} users per request.`, "userList")
        }
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.useAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.userType === "admin") {
            for (const user of byToken) {
                if (AuthService.isAdmin(user.id)) {
                    const error = new UnauthorizedError()
                    logger.warn(`删除用户${user.id}时, 校验失败, 来自:${payload?.id || authConfig.UNKNOWN_USER_ID}`, error);
                    result.push(formatRegisterResult(user, error))
                    continue;
                }
                try {
                    AuthService.deleteUser(user);
                    result.push(formatRegisterResult(user))
                    logger.info(`删除用户${user.id}, 来自:${payload.id}`)
                } catch (error) {
                    logger.warn(`删除用户${user.id}时, 校验失败, 来自:${payload.id}`, error);
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user => {
                const error = new UnauthorizedError()
                logger.warn(`删除用户${user.id}时, 校验失败, 来自:${payload?.id || authConfig.UNKNOWN_USER_ID}`, error);
                result.push(formatRegisterResult(user, error))
            })
        }
        for (const user of bySignature) {
            try {
                const { id, createdAt, signature } = user
                AuthService.verifyRSASignature([id], createdAt, signature)
                AuthService.deleteUser(user);
                result.push(formatRegisterResult(user))
                logger.info(`删除用户${user.id}, 来自:${authConfig.SIGNATURE_USER_ID}`)
            } catch (error) {
                logger.error(`删除用户${user.id}时, 校验失败, 来自:${authConfig.SIGNATURE_USER_ID}`, error);
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
    static async issuePasswordKey(req, res) {
        const { id, createdAt, signature } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.useAccessToken(token);
        let passwordKey;
        if (signature) {
            AuthService.verifyRSASignature([id], createdAt, signature)
            passwordKey = await AuthService.issuePasswordKey({ id });
            logger.info(`已为用户${id}签发pswd-key, 来自:${authConfig.SIGNATURE_USER_ID}`);
        } else if (!AuthService.isAdmin(payload?.id)) {
            passwordKey = await AuthService.issuePasswordKey({ id });
            logger.info(`已为用户${id}签发pswd-key, 来自:${payload.id}`);
        }
        if (!passwordKey) {
            return res.json({ passwordKey });
        } else {
            logger.warn(`尝试签发pswd-key失败, 来自:${payload?.id || authConfig.UNKNOWN_USER_ID}`)
            throw new UnauthorizedError()
        }
    }
    static async changePassword(req, res) {
        const { passwordKey, newPassword } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.verifyAccessToken(token);
        const { id } = payload;
        AuthService.changePassword({ id, passwordKey, newPassword });
        logger.info(`用户${id}更换密码成功`)
        return res.status(204).end();
    }
    static async changePasswordRequired(req, res) {
        const { passwordRequired } = req.body;
        const token = getAccessTokenFromReq(req);
        const payload = await AuthService.verifyAccessToken(token);
        const { id } = payload;
        AuthService.changePasswordRequired({ id, passwordRequired });
        logger.info(`用户${id}已将登录密码要求切换为${passwordRequired === 1 ? "" : "不"}要求密码`)
        return res.status(204).end();
    }
    static async changeAdminStatus(req, res) {
        const { id, isAdmin, signature, createdAt } = req.body;
        AuthService.verifyRSASignature([id, isAdmin], createdAt, signature)
        AuthService.changeAdminStatus({ id, isAdmin });
        AuthService.revokeRefreshTokenAll(id);
        isAdmin === 1 ?
            logger.info(`授予用户${id}的管理员权限, 已吊销其全部刷新令牌, 来自:${authConfig.SIGNATURE_USER_ID}`):
            logger.info(`撤销用户${id}的管理员权限, 已吊销其全部刷新令牌, 来自:${authConfig.SIGNATURE_USER_ID}`);
        return res.status(204).end();
    }
}
module.exports = AuthController