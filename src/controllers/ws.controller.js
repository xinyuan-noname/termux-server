const { WS_TOKEN_AGE } = require("../config/ws");
const { signJWT, generateRandomSafeString } = require("../utils/verification");

class WebSocketController {
    // eslint-disable-next-line no-unused-vars
    static handleTask(ws, req, data, isBinary) {

    }
    // eslint-disable-next-line no-unused-vars
    static handleClose(ws, req, code, reason) {

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