module.exports = {
    //password
    FLUTTER_DEVICE_LABEL:"Flutter APP",
    PASSWORD_MAX_LENGTH: 64,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_KEY_AGE: 30 * 60, // 30 minutes in seconds

    BANNED_ACCESS_TOKEN_REDIS_PREFIX: "banned_jti",
    ACCESS_TOKEN_AGE: "15min",

    REFRESH_TOKEN_AGE_APP: 30 * 24 * 3600, // 30 days in seconds
    REFRESH_TOKEN_AGE_DEFAULT: 1 * 24 * 3600, // 1 days in seconds
    REFRESH_TOKEN_COOKIE_OPTIONS: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth'
    },

    USER_TYPE_LIST: ["guest", "user", "admin"],

    UNKNOWN_USER_ID: "0000000000",
    SIGNATURE_USER_ID: "9999999999",
    BAD_SIGNATURE_USER_ID: "q999999999",

    ADDITION_USER_MAX_LENGTH: 30,
    DELETION_USER_MAX_LENGTH: 30,
};