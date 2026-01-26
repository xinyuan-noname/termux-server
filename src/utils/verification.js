const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const publicKeyPem = process.env.SUPER_ADMIN_PUBLIC_KEY;
const jwtSecret = process.env.JWT_SECRET;
function getAccessTokenFromReq(req) {
    if (!req) return null;
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
}
function signJWT(payload, options) {
    return jwt.sign(payload, jwtSecret, options);
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, jwtSecret);
    }
    catch (err) {
        logger.error('JWT校验出错', err);
        return null;
    }
}
function decodeJWT(token) {
    return jwt.decode(token)
}
/**
 * @param {string} message 
 * @param {string} signatureBase64 
 * @param {string} publicKeyPem 
 * @returns {boolean}
 */
function verifyRSASignature(message, signatureBase64) {
    if (!publicKeyPem) {
        const err = new Error('公钥缺失，无法验证签名');
        logger.error('公钥缺失，无法验证签名', err);
        return false;
    }
    if (!signatureBase64) {
        return false;
    }
    try {
        const signature = Buffer.from(signatureBase64, 'base64');
        return crypto.verify(
            'sha256',
            Buffer.from(message),
            publicKeyPem,
            signature
        );
    } catch (err) {
        logger.error('RSA签名校验出错', err);
        return false;
    }
}
/**
 * 
 * @param {number} byteLength 
 * @returns 
 */
function generateRandomSafeString(byteLength = 32) {
    return crypto.randomBytes(byteLength).toString("hex")
}
function convertToHash(str){
    return crypto.createHash("sha256").update(str).digest("hex")
}
module.exports = {
    getAccessTokenFromReq,
    signJWT,
    decodeJWT,
    verifyJWT,
    verifyRSASignature,
    generateRandomSafeString,
    convertToHash
};