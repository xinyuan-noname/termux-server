const checkValidRegExps = {
    isUnsignedInteger: /^\d+$/,
    isCnName: /^[\u4e00-\u9fff]+(?:\u00b7[\u4e00-\u9fff]+)*$/
}
function isUnsignedIntegerString(str) {
    return typeof str === "string" && checkValidRegExps.isUnsignedInteger.test(str)
}
function isCnNameString(str) {
    return typeof str === "string" && checkValidRegExps.isCnName.test(str)
}
/**
 * 将请求参数/请求体中的值转换为正整数, 无法转换时返回 null
 * @param {*} value - 待转换的值
 * @returns {number|null} 正整数或 null
 */
function toPositiveInteger(value) {
    if (typeof value === "number") {
        return Number.isSafeInteger(value) && value > 0 ? value : null;
    }
    if (typeof value !== "string" || !checkValidRegExps.isUnsignedInteger.test(value)) {
        return null;
    }
    const result = Number(value);
    return Number.isSafeInteger(result) && result > 0 ? result : null;
}
/**
 * 将时间字符串解析为毫秒数
 * 
 * @param {string} timeStr - 时间字符串，格式如 "1ms", "30s", "5min", "2h", 或 "1d"
 * @returns {number} 返回对应的时间毫秒数
 * @throws {TypeError} 当输入不是有效的时间格式时抛出错误
 */
const parseTimeToMs = (timeStr) => {
    // 匹配时间格式，例如 "1ms", "30s", "5min", "2h", 或 "1d"
    const match = timeStr.match(/^(\d+(?:\.\d*)?|\.\d+)(ms|s|min|h|d)$/);
    if (!match) {
        throw new TypeError(
            `Invalid time format: ${JSON.stringify(timeStr)}. ` +
            `Expected format like "1ms", "30s", "5min", "2h", or "1d".`
        );
    }
    const [, valueStr, unit] = match;
    const value = Number(valueStr);
    // 根据不同的时间单位转换为毫秒
    switch (unit) {
        case "ms": return Math.trunc(value);
        case "s": return Math.trunc(value * 1_000);
        case "min": return Math.trunc(value * 60_000);
        case "h": return Math.trunc(value * 3_600_000);
        case "d": return Math.trunc(value * 86_400_000);
        default: throw new Error(`Unexpected unit: ${unit}`);
    }
}
/**
 * 
 * @param {Date|string|number} time 
 * @param {`${number}${"ms"|"s"|"min"|"h"|"d"}`} expire 
 * @returns 
 */
function isExpired(time, expire) {
    time = time instanceof Date ? time : new Date(time);
    if (isNaN(time.getTime())) {
        return false;
    }
    const tolerance = parseTimeToMs(expire)
    const now = Date.now()
    const delta = now - time.getTime();
    return delta > tolerance;
}
module.exports = {
    isExpired,
    isUnsignedIntegerString,
    isCnNameString,
    toPositiveInteger
}