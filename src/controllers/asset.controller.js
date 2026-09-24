const FileLocation = require("../enum/file_location");
const { NotFoundError, FileUploadError } = require("../error");
const logger = require("../logger");
const AssetService = require("../service/asset.service");
const ProfilesServer = require("../service/profiles.service");
const { createBufferStream } = require("../utils/file");
const { enqueueConvertToPdf } = require("../utils/queue");

class AssetController {
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static getAvatar(req, res) {
        const params = req.params;
        if (!params.id) {
            throw new NotFoundError("未指定头像id");
        }
        const id = params.id
        const avatarPath = ProfilesServer.getAvatarPath({ id });
        res.setHeader('Cache-Control', 'public, max-age=43200');
        return res.sendFile(avatarPath, err => {
            if (err && !res.headersSent) {
                return res.status(500).end();
            }
        })
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async convertDocumentToPdf(req, res) {
        const { file } = req;
        if (!file) {
            throw new FileUploadError();
        }
        const { address, key } = await AssetService.cacheFileToRedis({ data: file.buffer });
        const isOk = await AssetService.checkPdfRedisCache({ address });
        if (isOk) {
            logger.info(`经检测过hash校验，已存在该文件。`, { req: req.requestId, file: { name: file.filename } })
        } else {
            enqueueConvertToPdf({
                source: FileLocation.redis,
                sourceReisdsKey: key,
                target: FileLocation.redis,
                targetRedisKey: AssetService.getPdfRedisKey({ address })
            });
        }
        return res.json({ address });
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async getPdf(req, res) {
        const { address } = req.params
        const pdfViewBuffer = await AssetService.getPdfRedisCache({ address });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'private, max-age=600');
        createBufferStream(pdfViewBuffer).pipe(res);
    }
    /**
    * @param {import("express").Request} req 
    * @param {import("express").Response} res 
    * @returns 
    */
    static async existPdf(req, res) {
        const { address } = req.params;
        const isOk = await AssetService.checkPdfRedisCache({ address });
        if (!isOk) {
            throw new NotFoundError();
        }
        return res.status(204).end();
    }
    /**
     * 上传事项里引用的图片, 返回可用于 %img[名称]% 标记的文件名
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {Promise<void>}
     */
    static async uploadImage(req, res) {
        const { file } = req;
        if (!file) {
            throw new FileUploadError();
        }
        const { id } = req.accessPayload;
        const { name, existed } = await AssetService.saveToDoImage({
            data: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname
        });
        logger.info(`${id}上传事项图片${name}`, { req: req.requestId, existed });
        return res.status(201).json({ name });
    }
    /**
     * 读取事项图片
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @returns {void}
     */
    static getImage(req, res) {
        const { name } = req.params;
        const imagePath = AssetService.getImagePath({ name });
        if (!imagePath) {
            throw new NotFoundError("图片不存在");
        }
        res.setHeader('Content-Type', AssetService.getImageContentType(name));
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return res.sendFile(imagePath, err => {
            if (err && !res.headersSent) {
                return res.status(500).end();
            }
        });
    }
}
module.exports = AssetController;