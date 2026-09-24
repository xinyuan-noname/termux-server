const BASICE_PROFILES_SEARCH_CONFGI = {
    username: true,
    gender: true,
    userType: true,
    position: true,
    academy: true,
    class: true,
    major: true,
    // 用户列表上直接展示获赞数, 不用再单独请求一次
    likeCount: true
}
const MY_PROFILE_SEARCH_CONFIG = {
    ...BASICE_PROFILES_SEARCH_CONFGI,
    passwordRequired: true
}
module.exports = {
    BASICE_PROFILES_SEARCH_CONFGI,
    MY_PROFILE_SEARCH_CONFIG
}