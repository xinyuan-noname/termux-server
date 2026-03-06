const removeQuery = (url) => {
    if (typeof url !== "string") return "";
    return url.split("?")[0];
}
const getUrlFromReq = (req) => {
    if(req.baseUrl!=)
    return `${req.baseUrl}/${req.path}`;
}
module.exports = {
    removeQuery,
    getUrlFromReq
}