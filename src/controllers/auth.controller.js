const { UnauthorizedError, ValidationError } = require("../error");
const { getTokenFromReq } = require("../utils/verification");
const AuthService = require("../service/auth.service");
const authConfig = require("../../config/auth")
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
        const { id, username, password } = req.body;
        const result = await AuthService.verifyCredentials({ id, username, password });
        const payload = { id, role: result.role };
        const accessToken = AuthService.issueAccessToken(payload);
        const { refreshToken } = await AuthService.issueRefreshToken(id);
        switch (true) {
            default: {
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/auth/refresh',
                    maxAge: authConfig.REFRESH_TOKEN_AGE * 1000
                })
            }
        }
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
        const token = getTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        let result;
        if (signature) {
            result = await AuthService.createUserBySignature({ id, username, password, passwordRequired, isAdmin, signature, createdAt })
        } else if (payload?.role === "admin") {
            result = await AuthService.createUser({ id, username, password, passwordRequired })
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
        const token = getTokenFromReq(req);
        const payload = AuthService.verifyAccessToken(token);
        const byToken = [], bySignature = [];
        userList.forEach(user => user.signature ? bySignature.push(user) : byToken.push(user));
        const result = []
        if (payload?.role === "admin") {
            for (const user of byToken) {
                try {
                    await AuthService.createUser(user);
                    result.push(formatRegisterResult(user))
                } catch (error) {
                    result.push(formatRegisterResult(user, error))
                }
            }
        } else {
            byToken.forEach(user =>
                result.push(formatRegisterResult(user, new UnauthorizedError()))
            )
        }
        for (const user of bySignature) {
            try {
                await AuthService.createUserBySignature(user);
                result.push(formatRegisterResult(user))
            } catch (error) {
                result.push(formatRegisterResult(user, error))
            }
        }
        return res.json({ result })
    }
}
module.exports = AuthController