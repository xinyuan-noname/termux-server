module.exports = {
    //password
    PASSWORD_MAX_LENGTH: 64,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_KEY_AGE: 30 * 60, // 30 minutes in seconds

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
};