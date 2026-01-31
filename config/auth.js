module.exports = {
    //password
    PASSWORD_MAX_LENGTH: 64,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_KEY_AGE: 30 * 60, // 30 minutes in seconds

    BANNED_ACCESS_TOKEN_REDIS_PREFIX: "banned_jti",
    ACCESS_TOKEN_AGE: "15min",

    REFRESH_TOKEN_AGE: 7 * 24 * 3600, // 7 days in seconds
    REFRESH_TOKEN_COOKIE_OPTIONS: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth'
    },

    REGISTRATION_SIGNATURE_AGE: "3min",

    USER_TYPE_LIST: ["guest", "user", "admin"],

    UNKNOWN_USER_ID: "0000000000",
    SIGNATURE_USER_ID: "9999999999",

    ADDITION_USER_MAX_LENGTH: 30,
    DELETION_USER_MAX_LENGTH: 30,
};