const BASICE_PROFILES_SEARCH_CONFGI = {
    username: true,
    gender: true,
    userType: true,
    position: true,
    academy: true,
    class: true,
    major: true
}
const MY_PROFILE_SEARCH_CONFIG = {
    ...BASICE_PROFILES_SEARCH_CONFGI,
    passwordRequired: true
}
module.exports = {
    BASICE_PROFILES_SEARCH_CONFGI,
    MY_PROFILE_SEARCH_CONFIG
}