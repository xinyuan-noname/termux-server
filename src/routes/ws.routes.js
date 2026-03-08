const WebSocketController = require("../controllers/ws.controller");
const access = require("../middleware/access");
const { onMessage, onClose } = require("../utils/ws");
const auth = require("../ws_middleware/auth");
/**
 * @import 
 * @param {import("express").Express} app 
 */
module.exports = (app) => {
    app.get("/ws/token", access, WebSocketController.issueToken);
    app.ws(
        "/ws/task", auth,
        /**
         * 
         * @param {import("ws").WebSocket} ws 
         * @param {import("express").Request} req 
         */
        (ws, req) => {
            const id = req.payload.id;
            WebSocketController.deliverPendingReminds(ws.req, { id: id })
            WebSocketController.addClient("task", id, ws);
            onMessage(ws, req, WebSocketController.handleTask);
            onClose(ws, req, WebSocketController.handleClose);
            WebSocketController.openHeartbeat(ws, req);
        }
    );
};