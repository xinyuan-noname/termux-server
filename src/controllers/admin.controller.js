const AuthService = require("../service/auth.service");
const authConfig = require("../../config/auth");
const logger = require("../logger");
class AdminController {
    /**
     * POST auth/register
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async register(req, res) {
        const { id, username, password, passwordRequired, isAdmin } = req.body;
        if (isAdmin === 0) {
            await AuthService.createUser({ id, username, password, passwordRequired });
            logger.info(`用户${id}注册成功, 来自:${authConfig.SIGNATURE_USER_ID}`);
        } else {
            await AuthService.createAdmin({ id, username, passwordRequired, password });
            logger.info(`用户${id}注册成功, 来自:${authConfig.SIGNATURE_USER_ID}`);
        }
        return res.status(204).end();
    }
}
module.exports = AdminController;