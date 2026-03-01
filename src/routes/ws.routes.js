const WebSocketController = require("../controllers/ws.controller");
const { onMessage, onClose } = require("../utils/ws");
const access = require("../ws_middleware/access");
/**
 * @import 
 * @param {import("express").Express} app 
 */
module.exports = (app) => {
    app.ws(
        "/ws/task", access,
        /**
         * 
         * @param {import("ws").WebSocket} ws 
         * @param {import("express").Request} req 
         */
        (ws, req) => {
            onMessage(ws, req, WebSocketController.handleTask);
            onClose(ws, req, WebSocketController.handleClose)
        }
    );
};