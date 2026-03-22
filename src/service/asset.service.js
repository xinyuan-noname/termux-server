const { ASSET_FILE_DATA_KEY, ASSET_PDF_DATA_KEY } = require("../config/asset_config");
const proxyRedis = require("../redis/proxy");
const { convertToHash } = require("../utils/verification");

class AssetService {
    static getPdfRedisKey({ address }) {
        return ASSET_PDF_DATA_KEY.replace('{address}', address)
    }
    /**
     * 
     * @param {{data:Buffer}} param0 
     * @returns 
     */
    static async cacheFileToRedis({ data }) {
        const address = convertToHash(data, "base64url");
        const key = ASSET_FILE_DATA_KEY.replace('{address}', address);
        const hasKey = Boolean(await proxyRedis.exists(key));
        if (!hasKey) {
            await proxyRedis.set(key, data);
        }
        return { address, key };
    }
    static async getPdfRedisCache({ address }) {
        const result = await proxyRedis.get(AssetService.getPdfRedisKey({ address }));
        return result;
    }
    static async checkPdfRedisCache({ address }) {
        const key = AssetService.getPdfRedisKey({ address })
        const hasKey = Boolean(await proxyRedis.exists(key));
        if (!hasKey) return false;
        const strLen = await proxyRedis.strLen(key);
        if (!strLen) return false;
        return true;
    }
}
module.exports = AssetService;