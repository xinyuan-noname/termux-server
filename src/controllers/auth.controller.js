const { UnauthorizedError } = require("../error");
const AuthService = require("../service/auth.service");
const authConfig = require("../../config/auth");
const logger = require("../logger");

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
        const data = { accessToken };
        switch (true) {
            case deviceDescription.startsWith(authConfig.FLUTTER_DEVICE_LABEL): {
                data.refreshToken = refreshToken;
            }; break;
            default: {
                res.cookie('refreshToken', refreshToken, {
                    ...authConfig.REFRESH_TOKEN_COOKIE_OPTIONS,
                    maxAge: authConfig.REFRESH_TOKEN_AGE_DEFAULT * 1000
                })
            }; break;
        }
        logger.info(`用户${id}登录成功, 签发访问令牌和刷新令牌`);
        return res.json(data);
    }
    /**
     * POST auth/login
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async logout(req, res) {
        let refreshToken;
        const deviceDescription = req.deviceDescription;
        const accessToken = req.accessToken
        const payload = req.accessPayload;
        switch (true) {
            case deviceDescription.startsWith(authConfig.FLUTTER_DEVICE_LABEL): {
                refreshToken = req.body.refreshToken;
            } break;
            default: {
                refreshToken = req.cookies.refreshToken;
                res.clearCookie('refreshToken', authConfig.REFRESH_TOKEN_COOKIE_OPTIONS);
            }; break;
        }
        if (payload.id && refreshToken) {
            await AuthService.revokeAccessToken(accessToken);
            AuthService.revokeRefreshTokenMatchId(payload.id, refreshToken);
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
            case deviceDescription.startsWith(authConfig.FLUTTER_DEVICE_LABEL): {
                refreshToken = req.body.refreshToken;
            }; break;
            default: {
                refreshToken = req.cookies.refreshToken;
            }; break;
        }
        const { id, userType } = AuthService.verifyRefreshToken(refreshToken, deviceDescription);
        const accessToken = AuthService.issueAccessToken({ id, userType });
        logger.info(`用户${id}刷新访问令牌`);
        return res.json({ accessToken });
    }

    static async issuePasswordKey(req, res) {
        const { id } = req.body;
        const payload = req.accessPayload;
        let passwordKey;
        if (payload?.userType === "admin") {
            const result = await AuthService.issuePasswordKey({ id });
            passwordKey = result.passwordKey;
            logger.info(`已为用户${id}签发pswd-key, 来自:${payload.id}`);
        }
        if (passwordKey) {
            return res.json({ passwordKey });
        } else {
            const error = new UnauthorizedError();
            logger.warn(`尝试为用户${id}签发pswd-key失败, 来自:${payload?.id || authConfig.UNKNOWN_USER_ID}`, error);
            throw error;
        }
    }
    static async resetPassword(req, res) {
        const { passwordKey, newPassword } = req.body;
        const payload = req.accessPayload;
        const { id } = payload;
        await AuthService.resetPassword({ id, passwordKey, newPassword });
        logger.info(`用户${id}更换密码成功`)
        return res.status(204).end();
    }
    static async changePasswordRequired(req, res) {
        const { passwordRequired } = req.body;
        const payload = req.accessPayload;
        const { id } = payload;
        AuthService.changePasswordRequired({ id, passwordRequired });
        logger.info(`用户${id}已将登录密码要求切换为${passwordRequired === 1 ? "" : "不"}要求密码`)
        return res.status(204).end();
    }
}
module.exports = AuthController