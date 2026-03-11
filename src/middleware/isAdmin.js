const { UnauthorizedError } = require("../error");

/**
 * 检查用户是否为管理员的中间件
 * 需要在access中间件之后使用
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 * @returns 
 */
module.exports = (req, res, next) => {
    if (!req.accessPayload) {
        throw new UnauthorizedError("没有检测到访问令牌", "INVALID_ACCESS_TOKEN");
    }

    const {  userType } = req.accessPayload;

    if (userType !== "admin") {
        throw new UnauthorizedError("权限不足", "INSUFFICIENT_PRIVILEGES");
    }

    next();
};