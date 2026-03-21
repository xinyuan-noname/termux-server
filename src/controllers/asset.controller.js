const FileLocation = require("../enum/file_location");
const { NotFoundError, FileUploadError } = require("../error");
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
        enqueueConvertToPdf({
            source: FileLocation.redis,
            sourceReisdsKey: key,
            target: FileLocation.redis,
            targetRedisKey: AssetService.getPdfRedisKey(address)
        });
        return res.json(address);
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
    static async existPdf(req, res) {
        const { address } = req.params
        const isOk = await AssetService.checkPdfRedisCache({ address });
        if(!isOk){
            throw new NotFoundError();
        }
        return res.status(204).end();
    }
}
module.exports = AssetController;