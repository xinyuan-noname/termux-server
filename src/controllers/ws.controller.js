const { UNKNOWN_USER_ID } = require("../config/auth");
const { WS_TOKEN_AGE } = require("../config/ws");
const logger = require("../logger");
const { signJWT, generateRandomSafeString } = require("../utils/verification");

class WebSocketController {
    // eslint-disable-next-line no-unused-vars
    static handleTask(ws, req, data, isBinary) {

    }
    /**
     * 处理 WebSocket 连接关闭事件
     * @param {import("ws").WebSocket} ws - WebSocket 实例
     * @param {import("express").Request} req - HTTP 请求对象
     * @param {number} code - 关闭连接的状态码
     * @param {string} reason - 关闭连接的原因
     */
    static handleClose(ws, req, code, reason) {
        logger.info(`WebSocket断开连接${req?.payload?.id ?? UNKNOWN_USER_ID} `, { code, reason });
    }


    static issueToken(req, res) {
        // eslint-disable-next-line no-unused-vars
        const { exp, jti, iat, ...payload } = req.accessPayload;
        const token = signJWT(payload, {
            expiresIn: WS_TOKEN_AGE,
            jwtid: generateRandomSafeString()
        })
        return res.json({ token });
    }
}
module.exports = WebSocketController;