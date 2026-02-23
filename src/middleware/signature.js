const AuthService = require("../service/auth.service");
const { UnauthorizedError } = require("../error");
const logger = require("../logger");
module.exports = {
    single: (words) => {
        return (req, res, next) => {
            const { createdAt, signature } = req.body;
            if (!signature) {
                throw new UnauthorizedError("没有找到签名", "INVALID_SIGNATURE");
            }
            const toVerifyWords = Object.keys(req.body).filter(k => words.includes(k)).map(k => req.body[k]);
            logger.info(`签名字段${words}分别为:${toVerifyWords}`);
            AuthService.verifyRSASignature(toVerifyWords, createdAt, signature);
            next();
        }
    },
    batch: (entry, words) => {
        return (req, res, next) => {
            if (!req.body[entry]) {
                throw new UnauthorizedError("没有找到签名入口", "INVALID_SIGNATURE");
            }
            for (const e of req.body[entry]) {
                const { createdAt, signature } = e;
                const toVerifyWords = Object.keys(e).filter(k => words.includes(k)).map(k => e[k]);
                AuthService.verifyRSASignature(toVerifyWords, createdAt, signature);
            }
            next();
        }
    }
}