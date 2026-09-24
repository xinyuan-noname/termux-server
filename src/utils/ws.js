const onMessage = (ws, req, handle) => {
    ws.on("message", (data, isBinary) => {
        handle(ws, req, data, isBinary);
    })
}
const onClose = (ws, req, handle) => {
    ws.on("close", (code, reason) => {
        handle(ws, req, code, reason);
    })
}


module.exports = {
    onMessage,
    onClose
};