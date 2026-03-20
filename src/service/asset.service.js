const { ASSET_FILE_DATA_KEY, ASSET_PDF_DATA_KEY } = require("../config/asset_config");
const proxyRedis = require("../redis/proxy");
const { generateRandomSafeString } = require("../utils/verification");

class AssetService {
    static getPdfRedisKey({ address }) {
        return ASSET_PDF_DATA_KEY.replace('${address}', address)
    }
    /**
     * @param {Buffer} data 
     */
    static async cacheFileToRedis({ data }) {
        const address = generateRandomSafeString();
        const key = ASSET_FILE_DATA_KEY.replace('{address}', address);
        await proxyRedis.set(key, data);
        return { address, key };
    }
    static async getPdfRedisCache({ address }) {
        return await proxyRedis.get(AssetService.getPdfRedisKey({ address }));
    }
}
module.exports = AssetService;