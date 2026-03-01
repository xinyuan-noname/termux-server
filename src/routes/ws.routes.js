const express = require('express');
const access = require('../ws_middleware/access');
const { onMessage, onClose } = require('../utils/ws');
const WebSocketController = require('../controllers/ws.controller');
const router = express.Router();

router.ws(
    "/task", access,
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
module.exports = router;