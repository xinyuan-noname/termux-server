const fs = require("fs");
const path = require("path");
const { ASSET_FILE_DATA_KEY, ASSET_PDF_DATA_KEY, ASSET_REDIS_EXPIRED_WINDOWS } = require("../config/asset_config");
const {
    TODO_IMAGE_EXTS,
    TODO_IMAGE_NAME_REGEXP,
    TODO_IMAGE_TAG_REGEXP,
    isToDoImageFile
} = require("../config/uploads");
const pathsConfig = require("../config/paths");
const { FileUploadError, ValidationError } = require("../error");
const logger = require("../logger");
const proxyRedis = require("../redis/proxy");
const { safeGetImagePath, resolveImagePath } = require("../utils/uploads");
const { convertToHash } = require("../utils/verification");

// 图片后缀与 Content-Type 的对应关系, 用于响应头
const IMAGE_CONTENT_TYPE_MAP = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp"
};
// mimetype 与后缀的对应关系, 优先按 mimetype 决定后缀
const MIME_EXT_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/x-ms-bmp": "bmp"
};

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
            await proxyRedis.expire(key, ASSET_REDIS_EXPIRED_WINDOWS);
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

    /**
     * 根据 mimetype 或原始文件名推断图片后缀
     * @param {string} mimetype - 文件类型
     * @param {string} [originalname] - 原始文件名
     * @returns {string|null} 图片后缀
     */
    static resolveImageExt(mimetype, originalname) {
        const byMime = MIME_EXT_MAP[mimetype];
        if (byMime) return byMime;
        const ext = path.extname(originalname || "").slice(1).toLowerCase();
        if (ext === "jpeg") return "jpg";
        return TODO_IMAGE_EXTS.includes(ext) ? ext : null;
    }

    /**
     * 校验事项图片文件名是否合法, 同时挡掉路径穿越
     * @param {string} name - 图片文件名
     * @returns {boolean} 是否合法
     */
    static isValidImageName(name) {
        return typeof name === "string" && TODO_IMAGE_NAME_REGEXP.test(name);
    }

    /**
     * 保存一张事项图片, 文件名取内容哈希, 重复上传同一张图不会产生新文件
     * @param {Object} params - 参数对象
     * @param {Buffer} params.data - 图片内容
     * @param {string} params.mimetype - 图片类型
     * @param {string} [params.originalname] - 原始文件名
     * @returns {Promise<{name:string,existed:boolean}>} 图片文件名
     */
    static async saveToDoImage({ data, mimetype, originalname }) {
        if (!Buffer.isBuffer(data) || data.length === 0) {
            throw new FileUploadError("图片内容为空");
        }
        if (!isToDoImageFile(mimetype, originalname)) {
            throw new ValidationError(`不支持的图片格式: ${mimetype}`, "image");
        }
        const ext = AssetService.resolveImageExt(mimetype, originalname);
        if (!ext) {
            throw new ValidationError("无法识别图片格式", "image");
        }
        const name = `${convertToHash(data, "hex")}.${ext}`;
        const filePath = resolveImagePath(name);
        if (fs.existsSync(filePath)) {
            return { name, existed: true };
        }
        if (!fs.existsSync(pathsConfig.IMAGE_DIR)) {
            fs.mkdirSync(pathsConfig.IMAGE_DIR, { recursive: true });
        }
        // 先写临时文件再改名, 避免读到写了一半的图片
        const tempPath = `${filePath}.${process.pid}.tmp`;
        fs.writeFileSync(tempPath, data);
        fs.renameSync(tempPath, filePath);
        logger.info(`保存事项图片${name}`, { size: data.length, mimetype });
        return { name, existed: false };
    }

    /**
     * 获取存在的图片绝对路径
     * @param {string} name - 图片文件名
     * @returns {string|null} 图片路径
     */
    static getImagePath({ name }) {
        if (!AssetService.isValidImageName(name)) return null;
        return safeGetImagePath(name);
    }

    /**
     * 根据文件名获取响应头使用的 Content-Type
     * @param {string} name - 图片文件名
     * @returns {string} Content-Type
     */
    static getImageContentType(name) {
        const ext = path.extname(name).slice(1).toLowerCase();
        return IMAGE_CONTENT_TYPE_MAP[ext] ?? "application/octet-stream";
    }

    /**
     * 删除一张事项图片
     * @param {string} name - 图片文件名
     * @returns {boolean} 是否真的删除了文件
     */
    static deleteImage({ name }) {
        const filePath = AssetService.getImagePath({ name });
        if (!filePath) return false;
        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (error) {
            if (error.code !== "ENOENT") {
                logger.warn(`删除事项图片${name}失败`, error);
            }
            return false;
        }
    }

    /**
     * 找出事项内容里引用的全部图片文件名
     * @param {string} content - 事项内容
     * @returns {Array<string>} 图片文件名列表
     */
    static extractImageNames(content) {
        if (typeof content !== "string" || content.length === 0) return [];
        const result = new Set();
        // 每次匹配前重置 lastIndex, 避免正则的全局状态影响多次调用
        TODO_IMAGE_TAG_REGEXP.lastIndex = 0;
        let match;
        while ((match = TODO_IMAGE_TAG_REGEXP.exec(content)) !== null) {
            result.add(match[1]);
        }
        return [...result];
    }

    /**
     * 删除不再被任何事项引用的图片
     * @param {Object} params - 参数对象
     * @param {string} params.removedContent - 被替换/删除的事项内容
     * @param {Array<string>} [params.otherContents] - 其余事项的内容
     * @returns {number} 删除的图片数量
     */
    static deleteUnusedImages({ removedContent, otherContents = [] }) {
        const candidates = AssetService.extractImageNames(removedContent);
        if (candidates.length === 0) return 0;
        const usedNames = new Set();
        for (const content of otherContents) {
            for (const name of AssetService.extractImageNames(content)) {
                usedNames.add(name);
            }
        }
        let deleted = 0;
        for (const name of candidates) {
            if (usedNames.has(name)) continue;
            if (AssetService.deleteImage({ name })) deleted++;
        }
        return deleted;
    }
}
module.exports = AssetService;
