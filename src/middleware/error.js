const multer = require("multer");
const { ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, TimeoutError, RateLimitError, TokenIssueError } = require("../error");
const logger = require("../logger");
const authConfig = require("../../config/auth")
// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
    let code, errorJSON;
    if (error instanceof UnauthorizedError) {
        if (error.code === "INVALID_SIGNATURE") {
            logger.warn(`收到高危操作请求, 来自:${authConfig.BAD_SIGNATURE_USER_ID}`);
        }
        code = 401;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof ForbiddenError) {
        code = 403;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof NotFoundError) {
        code = 404;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof ValidationError) {
        code = 400;
        errorJSON = { error: error.message, field: error.field, code: error.code };
    } else if (error instanceof ConflictError) {
        code = 409;
        errorJSON = { error: error.message, field: error.field, code: error.code };
    } else if (error instanceof TimeoutError) {
        code = 504;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof RateLimitError) {
        code = 429;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof TokenIssueError) {
        code = 500;
        errorJSON = { error: error.message, code: error.code };
    } else if (error instanceof multer.MulterError) {
        let message;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                code = 'LIMIT_FILE_SIZE'
                message = '文件过大，最大支持 2MB';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                code = 'LIMIT_FILE_SIZE'
                message = '字段名称错误，请使用正确的字段名上传';
                break;
            default:
                code = 'File_UPLOAD_FAILD'
                message = '文件上传失败';
        }
        return res.status(400).json({ error: message, code: error.code });
    }
    else if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ error: "Json syntax error", code: "INVALID_JSON_FORMAT" })
    }
    if (code && errorJSON) {
        logger.warn(error.message, error);
        return res.status(code).json(errorJSON);
    } else {
        logger.error(error.message, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}