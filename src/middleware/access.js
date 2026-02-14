const AuthService = require("../service/auth.service");
const { getAccessTokenFromReq } = require("../utils/verification");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
module.exports = async (req, res, next) => {
    const token = getAccessTokenFromReq(req);
    const payload = await AuthService.verifyAccessToken(token);
    req.access = payload;
    next();
}