class ValidationError extends Error {
    constructor(message, field = null, code = 'VALIDATION_ERROR') {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
        Error?.captureStackTrace?.(this, ValidationError);
    }
}
class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized access', code = 'UNAUTHORIZED') {
        super(message);
        this.name = 'UnauthorizedError';
        this.code = code;
        Error?.captureStackTrace?.(this, UnauthorizedError);
    }
}
class ForbiddenError extends Error {
    constructor(message = 'Forbidden access', code = 'FORBIDDEN') {
        super(message);
        this.name = 'ForbbidenError';
        this.code = code;
        Error?.captureStackTrace?.(this, ForbiddenError);
    }
}
class NotFoundError extends Error {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message);
        this.name = 'NotFoundError';
        this.code = code;
        Error?.captureStackTrace?.(this, NotFoundError);
    }
}
class ConflictError extends Error {
    constructor(message, field, code = 'CONFLICT') {
        super(message);
        this.name = 'ConflictError';
        this.field = field;
        this.code = code;
        Error?.captureStackTrace?.(this, ConflictError);
    }
}
class TimeoutError extends Error {
    constructor(message = 'Request timeout', code = 'REQUEST_TIMEOUT') {
        super(message);
        this.name = 'TimeoutError';
        this.code = code;
        Error?.captureStackTrace?.(this, TimeoutError);
    }
}
class RateLimitError extends Error {
    constructor(message = "Too many request", code = "RATE_LIMIT_EXCEEDED") {
        super(message);
        this.name = "RateLimitError";
        this.code = code;
        Error?.captureStackTrace?.(this, RateLimitError);
    }
}
class TokenIssueError extends Error {
    constructor(message = "Failed to issue tokens", code = "TOKEN_ISSUE_FAILED") {
        super(message);
        this.name = "TokenIssueError";
        this.code = code;
        Error?.captureStackTrace?.(this, TokenIssueError);
    }
}
class FileUploadError extends Error {
    constructor(message = "Failed to upload file", code = "FILE_UPLOAD_FAILED") {
        super(message);
        this.name = "FileUploadError";
        this.code = code;
        Error?.captureStackTrace?.(this, FileUploadError);
    }
}
module.exports = {
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    TimeoutError,
    RateLimitError,
    TokenIssueError,
    FileUploadError,
}