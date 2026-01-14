const { UnauthorizedError, ValidationError } = require("../error");
const AuthService = require("../service/auth.service");
const { getTokenFromReq } = require("../utils/verification");
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
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    static async login(req, res) {
        const { id, username, password } = req.body;
        const result = await AuthService.verifyCredentials({ id, username, password });
        const payload = { id, role: result.role };
        const token = AuthService.signAccessToken(payload)
        return res.json({ accessToken: token });
    }
    /**
     * POST auth/register
     * @param {Request} req 
     * @param {Response} res 
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
     * @param {Request} req 
     * @param {Response} res 
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