const { ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, TimeoutError, RateLimitError, TokenIssueError } = require("../error");
const logger = require("../logger");

module.exports = (error, req, res, next) => {
    let code, errorJSON;
    if (error instanceof UnauthorizedError) {
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
    }
    if (code && errorJSON) {
        logger.warn(error.message);
        return res.status(code).json(errorJSON);
    } else {
        logger.error(error.message, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}