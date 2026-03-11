const AuthService = require("../service/auth.service");
const { getAccessTokenFromReq } = require("../utils/verification");
const access = async (req, res, next) => {
    const token = getAccessTokenFromReq(req);
    const payload = await AuthService.verifyAccessToken(token);
    req.accessPayload = payload;
    req.accessToken = token;
    next();
}
/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
module.exports = access;