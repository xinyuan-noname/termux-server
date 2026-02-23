const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const authConfig = require('../config/auth');
const { isExpired } = require('./validation');
const publicKeyPem = process.env.SUPER_ADMIN_PUBLIC_KEY;
const jwtSecret = process.env.JWT_SECRET;
const redis = require('../redis');
function getAccessTokenFromReq(req) {
    try {
        if (!req) return null;
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
        return parts[1];
    } catch {
        return null;
    }
}
function signJWT(payload, options) {
    return jwt.sign(payload, jwtSecret, options);
}

function verifyJWT(token) {
    return jwt.verify(token, jwtSecret);
}
function decodeJWT(token) {
    return jwt.decode(token)
}
async function banJWT(token) {
    const { jti, exp, iat } = decodeJWT(token);
    const key = `${authConfig.BANNED_ACCESS_TOKEN_REDIS_PREFIX}:${jti}`;
    const exists = (await redis.exists(key)) === 1;
    if (exists) return;
    const ttl = exp - iat;
    await redis.set(key, 'banned', 'EX', ttl, 'NX');
}
async function checkJWTIsBanned(jti) {
    const key = `${authConfig.BANNED_ACCESS_TOKEN_REDIS_PREFIX}:${jti}`;
    return (await redis.exists(key)) === 1;
}
/**
 * @param {string} message 
 * @param {string} signatureBase64 
 * @param {string} publicKeyPem 
 * @returns {boolean}
 */
function verifyRSASignature(args, createdAt, signatureBase64) {
    if (!publicKeyPem) {
        const err = new Error('公钥缺失，无法验证签名');
        logger.error(err.message, err);
        return false;
    }
    if (!signatureBase64) {
        return false;
    }
    if (isExpired(createdAt, process.env.REGISTRATION_SIGNATURE_AGE)) {
        const err = new Error('签名过期，无法验证签名');
        logger.error(err.message, err)
        return false
    }
    try {
        const message = Array.isArray(args) ? [...args, createdAt].join('|') : args;
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
function generateCDKey(groups, sizePerGroup) {
    groups = Number(groups) || 4;
    sizePerGroup = Number(sizePerGroup) || 4;
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const length = groups * sizePerGroup;
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
        if ((i + 1) % sizePerGroup === 0 && i !== length - 1) {
            result += '-';
        }
    }
    return result;
}
function convertToHash(str) {
    return crypto.createHash("sha256").update(str).digest("hex")
}
module.exports = {
    getAccessTokenFromReq,
    signJWT,
    decodeJWT,
    verifyJWT,
    banJWT,
    checkJWTIsBanned,
    verifyRSASignature,
    generateRandomSafeString,
    generateCDKey,
    convertToHash
};