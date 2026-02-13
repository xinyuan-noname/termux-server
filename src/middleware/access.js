const AuthService = require("../service/auth.service");
const { getAccessTokenFromReq } = require("../utils/verification");

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
// eslint-disable-next-line no-unused-vars
module.exports = async (req, res) => {
    const token = getAccessTokenFromReq(req);
    const payload = await AuthService.verifyAccessToken(token);
    req.access = payload;
}