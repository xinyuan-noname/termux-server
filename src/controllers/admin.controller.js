const AuthService = require("../service/auth.service");
const authConfig = require("../config/auth");
const logger = require("../logger");
const { ValidationError, FileUploadError } = require("../error");
const ProfilesServer = require("../service/profiles.service");
const { readExcelBufferAsJson } = require("../utils/file");
const formatBatchResult = (user, error) => {
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
class AdminController {
    static async check(req, res) {
        return res.status(204).end();
    }
    /**
     * POST auth/register
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async elevatePrivileges(req, res) {
        const payload = req.accessPayload;
        const { id } = payload;
        const newPayload = { id, userType: "admin", position: "闪纺(Shine Yarn)" };
        const accessToken = AuthService.issueAccessToken(newPayload);
        return res.json({ accessToken });
    }
    /**
     * POST auth/register
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async register(req, res) {
        const { id, username, password, gender, passwordRequired, isAdmin } = req.body;
        if (isAdmin === 0) {
            await AuthService.createUser({ id, username, password, passwordRequired });
            logger.info(`用户${id}注册成功, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId });
        } else {
            await AuthService.createAdmin({ id, username, passwordRequired, password });
            logger.info(`管理员${id}注册成功, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId });
        }
        ProfilesServer.changeGender({ id, gender });
        return res.status(201).end();
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async registerBatch(req, res) {
        req.file.fieldname
        const { userList } = req.body;
        const result = AuthService.createUserBatch({ userList });
        return res.json(result)
    }
    /**
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns 
     */
    static async registerFromExcel(req, res) {
        const { file } = req;
        if (!file) {
            throw new FileUploadError();
        }
        const data = readExcelBufferAsJson(file.buffer);
        const authList = [];
        const profileList = [];
        for (const user of data) {
            const { id, password, gender, position, major, "class": $class, academy, ...rest } = user;
            authList.push({ id: String(id), password: String(password), ...rest })
            profileList.push({ id: String(id), gender, position, major, "class": $class, academy });
        }
        const result = await AuthService.createUserBatch({ userList: authList });
        for (const { id, gender, major, "class": $class, academy, position } of profileList) {
            ProfilesServer.changePosition({ id, position });
            ProfilesServer.changeGender({ id, gender });
            ProfilesServer.changeClass({ id, "class": $class });
            ProfilesServer.changeMajor({ id, major });
            ProfilesServer.changeAcademy({ id, academy });
        }
        return res.json(result);
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async changeAdminStatus(req, res) {
        const { id, isAdmin } = req.body;
        AuthService.changeAdminStatus({ id, isAdmin });
        AuthService.revokeRefreshTokenAll(id);
        isAdmin === 1 ?
            logger.info(`已授予用户${id}的管理员权限, 已吊销其全部刷新令牌, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId }) :
            logger.info(`已撤销用户${id}的管理员权限, 已吊销其全部刷新令牌, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId });
        return res.status(204).end();
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async changePosition(req, res) {
        const { id, position } = req.body;
        ProfilesServer.changePosition({ id, position });
        logger.info(`将用户${id}的职位设置为${position}, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId });
        return res.status(204).end();
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async delete(req, res) {
        const { id } = req.body;
        AuthService.deleteUser({ id });
        return res.status(204).end();
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async deleteBatch(req, res) {
        const { userList } = req.body;
        if (!Array.isArray(userList)) {
            throw new ValidationError("Invalid userList, expected userList to be an array", "userList")
        }
        if (userList.length > authConfig.DELETION_USER_MAX_LENGTH) {
            throw new ValidationError(`Batch deletion is limited to ${authConfig.DELETION_USER_MAX_LENGTH} users per request.`, "userList")
        }
        const result = [];
        for (const user of userList) {
            const { id } = user
            try {
                AuthService.deleteUser({ id });
                logger.info(`删除用户${id}成功, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId })
                result.push(formatBatchResult({ id }))
            } catch (error) {
                logger.error(`删除用户${id}失败, 来自:${authConfig.BAD_SIGNATURE_USER_ID}`, error);
                result.push(formatBatchResult({ id }, error))
            }
        }
        return res.json(result)
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async issuePasswordKey(req, res) {
        const { id } = req.body;
        let passwordKey;
        const result = await AuthService.issuePasswordKey({ id });
        passwordKey = result.passwordKey
        logger.info(`已为用户${id}签发pswd-key, 来自:${authConfig.SIGNATURE_USER_ID}`, { req: req.requestId });
        return res.json({ passwordKey });
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getUserInfoBatch(req, res) {
        const { idList, config } = req.body;
        const result = ProfilesServer.getUserInfoBatch({ idList, config });
        return res.json(result);
    }
}
module.exports = AdminController;