function fullIpToSafeIp(ip) {
    if (ip.includes(".")) {
        return ip.split(".").slice(0,-1).join(".");
    }
    if(ip.includes(":")){
        return ip.split(":").slice(0,4).join(":")+"::/64"
    }
    return ip;
}
module.exports = {
    fullIpToSafeIp
}