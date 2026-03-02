const AuthService = require("../service/auth.service");

class WebSocketController {
    // eslint-disable-next-line no-unused-vars
    static handleTask(ws, req, data, isBinary) {

    }
    // eslint-disable-next-line no-unused-vars
    static handleClose(ws, req, code, reason) {

    }

    static issueToken(req, res) {
        const payload = req.accessPayload;
        const token = AuthService.issueAccessToken(payload);
        return res.json({ token });
    }
}
module.exports = WebSocketController;