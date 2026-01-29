const { ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, TimeoutError, RateLimitError, TokenIssueError } = require("../error");
const logger = require("../logger");

module.exports = (error, req, res, next) => {
    logger.error(error.message, error);
    if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message, code: error.code });
    }
    if (error instanceof ForbiddenError) {
        return res.status(403).json({ error: error.message, code: error.code });
    }
    if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message, code: error.code });
    }
    if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message, field: error.field, code: error.code });
    }
    if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message, field: error.field, code: error.code });
    }
    if (error instanceof TimeoutError) {
        return res.status(504).json({ error: error.message, code: error.code })
    }
    if (error instanceof RateLimitError) {
        return res.status(429).json({ error: error.message, code: error.code })
    }
    if (error instanceof TokenIssueError) {
        return res.status(500).json({ error: error.message, code: error.code });
    }
    return res.status(500).json({ error: 'Internal server error' });
}