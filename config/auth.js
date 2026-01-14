module.exports = {
    PASSWORD_MAX_LENGTH: 64,
    PASSWORD_MIN_LENGTH: 8,
    ACCESS_TOKEN_AGE: "15min",
    REFRESH_TOKEN_AGE:7 * 24 * 3600,
    REGISTRATION_SIGNATURE_AGE: "3min",
    REFRESH_TOKEN_COOKIE_OPTIONS: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth'
    }
};